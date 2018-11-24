import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as Models from '../models'
import * as Middleware from '../helpers/middleware'
import * as Errors from '../helpers/errors'
import { isNullOrUndefined } from 'util';

export function initUsersController(app: Express.Express, modelsFactory: Models.Factory) {

    app.post('/users', [
        Validator.body('name').isString(),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {

        return (async (): Bluebird<Express.Response> => {
            const result = await modelsFactory.userModel.create({name: req.body.name})

            return res.json(result)
        })().asCallback(next)
    })

    app.get('/users', [
        Validator.query('page').optional().isInt({gt: 0}), 
        Validator.query('size').optional().isInt({lt: 101, gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const page = isNullOrUndefined(req.query.page) ? 1 : req.query.page

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const result = await modelsFactory.userModel.findAndCountAll({
                offset: Middleware.calculatePaginationOffset(page, limit),
                limit
            })
            return res.json(result) 
        })().asCallback(next)
    })

    app.get('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {

        return (async (): Bluebird<Express.Response> => {
            const userId = req.params.user_id

            const result = await modelsFactory.userModel.findById(userId)
            
            if (result) {
                return res.json(result) 
            }

            throw new Errors.NotFoundError(Models.userName, userId)
        })().asCallback(next)
    })

    app.patch('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const userId = req.params.user_id
        
            const result = await modelsFactory.userModel
                .findById(userId)

            if (!result) {
                throw next(new Errors.NotFoundError(Models.userName, userId))
            }

            if (result.name === req.body.name) {
                return res.json(result) 
            }

            await result.update({name: req.body.name})

            return res.json(result) 
        })().asCallback(next)
    })

    app.delete('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const userId = req.params.user_id

            const result = await modelsFactory.userModel.destroy({
                where: {
                    user_id: userId
                }
            })
            
            if (result === 1) {
                return res.status(200)
            }

            throw next(new Errors.NotFoundError(Models.userName, userId))
        })().asCallback(next)
    })
}