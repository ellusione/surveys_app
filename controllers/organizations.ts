import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import Factory from '../models/factory'
import * as ModelTypes from '../models'
import * as Middleware from '../helpers/middleware'
import makeAuthMiddleware from '../helpers/auth_middleware'
import { isNullOrUndefined } from 'util';
import {Capability, adminRole} from '../roles'
import * as Errors from '../helpers/errors'

export function initOrganizationsController(app: Express.Express, modelsFactory: Factory) {
    const authMiddleware = makeAuthMiddleware(modelsFactory)

    function checkMemberAuth (capability: Capability) {
        return (req: Express.Request, res: Express.Response, next: Function) => {

            return (async (): Bluebird<void> => {
                switch (req.auth.type) {
                    case 'member': {
                        const member = await authMiddleware.getAndCheckMemberAuth(req.auth, capability)

                        if (member.organization_id !== req.params.organization_id) {
                            throw new Errors.UnauthorizedError()
                        }
                        res.locals.auth_member = member
                        return
                    }

                    default: throw new Errors.UnauthorizedError()
                }
            })().asCallback(next)
        }
    }
    
    app.post('/organizations', [
        Validator.body('name').isString(),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            if (req.auth.type !== 'user') {
                throw new Errors.UnauthorizedError()
            }

            const result = await modelsFactory.organizationModel.create({name: req.body.name})

            await modelsFactory.memberModel.create({
                user_id: req.auth.id,
                organization_id: <number> result.id,
                role_id: adminRole.id
            })

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
            throw new Errors.NotFoundError(ModelTypes.organizationName, organizationId)
        })().asCallback(next)
    })

    app.patch('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        checkMemberAuth(Capability.Edit),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organizationId = req.params.organization_id

            const result = await modelsFactory.organizationModel
                .findById(organizationId)

            if (!result) {
                throw new Errors.NotFoundError(ModelTypes.organizationName, organizationId)
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
        checkMemberAuth(Capability.Delete),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
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

            throw new Errors.NotFoundError(ModelTypes.organizationName, organizationId)
        })().asCallback(next)
    })
}