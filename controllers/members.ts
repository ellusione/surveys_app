import Express from 'express';
import Validator from 'express-validator/check'
import * as Models from '../models'
import * as Middleware from '../helpers/middleware'
import { isNullOrUndefined } from 'util';
import {Role} from '../roles'
import * as Errors from '../helpers/errors'

export function initMembersController(app: Express.Express, modelsFactory: Models.Factory) {

    app.post('/members', [
        Validator.body('user_id').isInt({gt: 0}),
        Validator.body('organization_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const userId = req.body.user_id

        const user = await modelsFactory.userModel.findById(userId)

        if (!user) {
            return next(new Errors.NotFoundError(Models.userName, userId))
        }

        const organization = await modelsFactory.organizationModel.findById(req.body.organization_id)

        if (!organization) {
            return res.send('Organization not found')
        }

        const result = await modelsFactory.memberModel.create({
            user_id: req.body.user_id, 
            organization_id: req.body.organization_id,
            role_id: req.body.role_id
        })

        return res.send(result)
    })
    
    app.get('/members', [
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('size').optional().isInt({lt: 101, gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

        const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

        const result = await modelsFactory.memberModel.findAndCountAll({
            offset: page * limit,
            limit
        })

        res.json(result) //is total correct?
    })

    app.get('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const memberId = req.params.member_id
        const result = await modelsFactory.memberModel.findById(memberId)

        if (result) {
            res.json(result) 
        }
        return next(new Errors.NotFoundError(Models.memberName, memberId))
    })

    app.patch('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const memberId = req.params.member_id
        const result = await modelsFactory.memberModel.findById(memberId)

        if (!result) {
            return next(new Errors.NotFoundError(Models.memberName, memberId))
        }

        if (result.role_id === req.body.role_id) {
            res.send(result)
        }

        await result.update({role_id: req.body.role_id})

        return res.json(result)
    })

    app.delete('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const memberId = req.params.member_id
        const result = await modelsFactory.memberModel.destroy({
            where: {
                id: memberId
            }
        })

        if (result === 1) {
            return res.status(200)
        }

        return next(new Errors.NotFoundError(Models.memberName, memberId))
    })
}