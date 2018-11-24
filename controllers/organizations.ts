import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as Models from '../models'
import * as Middleware from '../helpers/middleware'
import { isNullOrUndefined } from 'util';
import {Role, Capabilities} from '../roles'
import * as Errors from '../helpers/errors'

export function initOrganizationsController(app: Express.Express, modelsFactory: Models.Factory) {

    app.post('/organizations', [
        Validator.body('name').isString(),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const result = await modelsFactory.organizationModel.create({name: req.body.name})

            return res.json(result)
        })().asCallback(next)
    })

    app.get('/organizations', [
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('size').optional().isInt({lt: 101, gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const result = await modelsFactory.organizationModel.findAndCountAll({
                offset: page * limit,
                limit
            })

            return res.json(result) 
        })().asCallback(next)
    })

    app.get('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organizationId = req.params.organization_id
            const result = await modelsFactory.organizationModel.findById(organizationId)

            if (result) {
                return res.json(result) 
            }
            throw new Errors.NotFoundError(Models.organizationName, organizationId)
        })().asCallback(next)
    })

    app.patch('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        Validator.body('user_id').isInt({gt: 0}), //HACK. MOVE TO AUTH. FIXME
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organizationId = req.body.organization_id

            const member = await modelsFactory.memberModel.findOne({
                where: {
                    user_id: req.body.user_id,
                    organization_id: organizationId
                }
            })

            if (!member) {
                throw new Errors.NotFoundError(Models.memberName)
            }

            const role = Role.findByRoleId(member.role_id)

            if (!role.capabilities.get(Capabilities.Edit)) {
                throw new Errors.ForbiddenError(
                    'Member not authorized to edit organization'
                )
            }

            const result = await modelsFactory.organizationModel
                .findById(req.params.organization_id)

            if (!result) {
                throw new Errors.NotFoundError(Models.organizationName, organizationId)
            }

            if (result.name === req.body.name) {
                return res.json(result) 
            }

            await result.update({name: req.body.name})

            return res.json(result) 
        })().asCallback(next)
    })

    app.delete('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const member = await modelsFactory.memberModel.findOne({
                where: {
                    user_id: req.body.user_id,
                    organization_id: req.body.organization_id
                }
            })

            if (!member) {
                throw new Errors.NotFoundError(Models.memberName)
            }

            const role = Role.findByRoleId(member.role_id)

            if (!role.capabilities.get(Capabilities.Delete)) {
                throw new Errors.ForbiddenError(
                    'Member not authorized to delete organization'
                )
            }

            const organizationId = req.params.organization_id
            
            const result = await modelsFactory.organizationModel
                .destroy({
                    where: {
                        id: organizationId
                    }
                }) 

            if (result === 1) {
                return res.status(200)
            }

            throw new Errors.NotFoundError(Models.organizationName, organizationId)
        })().asCallback(next)
    })
}