import Express from 'express';
import Validator from 'express-validator/check'
import * as Models from '../models'
import {validationErrorHandlingFn} from '../helpers/middleware'
import * as Errors from '../helpers/errors'
import { isNullOrUndefined } from 'util';

export function initUsersController(app: Express.Express, modelsFactory: Models.Factory) {

    app.post('/users', [
        Validator.body('name').isString(),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const result = await modelsFactory.userModel.create({name: req.body.name})

        return res.json(result)
    })

    app.get('/users', [
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('limit').optional().isInt({lt: 101, gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

        const limit = isNullOrUndefined(req.query.limit) ? 10 : req.query.limit

        const result = await modelsFactory.userModel.findAndCountAll({
            offset: page * limit,
            limit: limit
        })
        return res.json(result) //is total correct?
    })

    app.get('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const userId = req.params.user_id

        const result = await modelsFactory.userModel.findById(userId)
        
        if (result) {
            return res.json(result) 
        }

        return next(new Errors.NotFoundError('user', userId))
    })

    app.patch('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const userId = req.params.user_id
        
        const result = await modelsFactory.userModel
            .findById(userId)

        if (!result) {
            return next(new Errors.NotFoundError('user', userId))
        }

        if (result.name === req.body.name) {
            return res.json(result) 
        }

        await result.update({name: req.body.name})

        return res.json(result) 
    })

    app.delete('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const userId = req.params.user_id

        const result = await modelsFactory.userModel.destroy({
            where: {
                user_id: userId
            }
        })
        
        if (result === 1) {
            return res.status(200)
        }

        return next(new Errors.NotFoundError('user', userId))
    })
}