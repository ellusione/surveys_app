import Express from 'express';
import Validator from 'express-validator/check'
import * as Models from '../models'
import {validationErrorHandlingFn} from '../helpers/middleware'
import { isNullOrUndefined } from 'util';
import {Role} from '../roles'

export function initMembersController(app: Express.Express, modelsFactory: Models.Factory) {

    app.post('/members', [
        Validator.body('user_id').isInt({gt: 0}),
        Validator.body('organization_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {

        const user = await modelsFactory.userModel.findById(req.body.user_id)

        if (!user) {
            return res.send('User not found')
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
        Validator.query('limit').optional().isInt({lt: 101, gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

        const limit = isNullOrUndefined(req.query.limit) ? 10 : req.query.limit

        const result = await modelsFactory.memberModel.findAndCountAll({
            offset: page * limit,
            limit: limit
        })

        res.json(result) //is total correct?
    })

    app.get('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const result = await modelsFactory.memberModel.findById(req.params.member_id)

        if (result) {
            res.json(result) 
        }
        return res.status(404)
    })

    app.patch('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const result = await modelsFactory.memberModel.findById(req.params.member_id)

        if (!result) {
            return res.status(404)
        }

        if (result.role_id === req.body.role_id) {
            res.send(result)
        }

        await result.update({role_id: req.body.role_id})

        return res.status(200).send(result)
    })

    app.delete('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const result = await modelsFactory.memberModel.destroy({
            where: {
                id: req.params.member_id
            }
        })

        if (result === 1) {
            return res.status(200)
        }

        return res.status(404)
    })
}