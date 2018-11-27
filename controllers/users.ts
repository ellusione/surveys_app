import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as bcrypt from 'bcryptjs'
import Factory from '../models/factory'
import ResourcesMiddleware from '../middleware/resources';
import AuthMiddleware from '../middleware/auth';
import * as Middleware from '../middleware'
import {Capability} from '../roles'
import { isNullOrUndefined } from 'util';

export function initUsersController(
    app: Express.Express, 
    modelsFactory: Factory, 
    resourcesMiddleware: ResourcesMiddleware, 
    authMiddleware: AuthMiddleware
) {

    app.post('/users', [
        Validator.body('name').isString(),
        Validator.body('username').isString(),
        Validator.body('password').isString(),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {

        return (async (): Bluebird<Express.Response> => {
            const result = await modelsFactory.userModel.create({
                name: req.body.name,
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 8)
            })

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
        resourcesMiddleware.loadUser.bind(resourcesMiddleware),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        return res.json(Middleware.getUser(req))
    })

    app.patch('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        resourcesMiddleware.loadUser.bind(resourcesMiddleware),
        authMiddleware.setEitherAuth.bind(authMiddleware),
        authMiddleware.verifyEitherAuthAccessOfUser(Capability.Edit).bind(authMiddleware),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = Middleware.getUser(req)

            if (user.name === req.body.name) {
                return res.json(user) 
            }

            await user.update({name: req.body.name})

            return res.json(user) 
        })().asCallback(next)
    })

    app.delete('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        resourcesMiddleware.loadUser.bind(resourcesMiddleware),
        authMiddleware.setEitherAuth.bind(authMiddleware),
        authMiddleware.verifyEitherAuthAccessOfUser(Capability.Delete).bind(authMiddleware),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = Middleware.getUser(req)

            await user.destroy()
           
            return res.sendStatus(200)
        })().asCallback(next)
    })
}