import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as bcrypt from 'bcryptjs'
import * as Factory from '../models/factory'
import * as ModelTypes from '../models'
import * as Middleware from '../middleware';
import { isNullOrUndefined } from 'util';

export function initUsersController(
    app: Express.Express, 
    modelsFactory: Factory.Models, 
    middleware: Middleware.Middleware
) {

    app.post('/users', [
        Validator.body('name').isString(),
        Validator.body('username').isString(),
        Validator.body('password').isString(),
        Validator.body('email').isString(),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {

        return (async (): Bluebird<Express.Response> => {
            const user = await modelsFactory.userModel.create({
                name: req.body.name,
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 8),
                email: req.body.email
            })

            const json = user.toJSON()
            delete json.username
            delete json.password
            delete json.email
            return res.json(json)
        })().asCallback(next)
    })

    app.get('/users', [
        Validator.query('page').optional().isInt({gt: 0}), 
        Validator.query('size').optional().isInt({lt: 101, gt: 0}),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const page = isNullOrUndefined(req.query.page) ? 1 : req.query.page

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const result = await modelsFactory.userModel.findAndCountAll({
                offset: Middleware.Base.calculatePaginationOffset(page, limit),
                limit
            })
            return res.json(result) 
        })().asCallback(next)
    })

    app.get('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        middleware.resourceLoader.loadUser.bind(middleware.resourceLoader),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {

        let user: ModelTypes.UserInstance
        try {
            user = Middleware.Resource.getUser(req)
        } catch (err) {
            return next(err)
        }
        return res.json(user)
    })

    app.patch('/users/:user_id', [ //todo patch username, password, email
        Validator.param('user_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        middleware.resourceLoader.loadUser.bind(middleware.resourceLoader),
        middleware.authSetter.setEitherAuth.bind(middleware.authSetter),
        Middleware.AuthAccess.verifyEitherAuthAccessOfUser,
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = Middleware.Resource.getUser(req)

            if (user.name === req.body.name) {
                return res.json(user) 
            }

            await user.update({name: req.body.name})

            return res.json(user) 
        })().asCallback(next)
    })

    app.delete('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        middleware.resourceLoader.loadUser.bind(middleware.resourceLoader),
        middleware.authSetter.setEitherAuth.bind(middleware.authSetter),
        Middleware.AuthAccess.verifyEitherAuthAccessOfUser,
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = Middleware.Resource.getUser(req)

            await user.destroy()
           
            return res.sendStatus(200)
        })().asCallback(next)
    })
}