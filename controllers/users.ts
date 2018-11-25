import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as bcrypt from 'bcryptjs'
import Factory from '../models/factory'
import * as ModelTypes from '../models'
import * as Middleware from '../helpers/middleware'
import makeAuthMiddleware from '../helpers/auth_middleware'
import * as Errors from '../helpers/errors'
import {Capability} from '../roles'
import { isNullOrUndefined } from 'util';

export function initUsersController(app: Express.Express, modelsFactory: Factory) {
    const authMiddleware = makeAuthMiddleware(modelsFactory) //maybe move to injection to optimize objects count (to make shared)

    function checkAuth (capability: Capability) {
        return (req: Express.Request, res: Express.Response, next: Function) => {

            return (async (): Bluebird<void> => {
                switch (req.auth.type) {
                    case 'user': {
                        authMiddleware.checkUserAuth(req.auth, req.params.user_id)
                        return
                    }

                    case 'member': {
                        if (req.auth.id !== req.params.user_id) {
                            await authMiddleware.getAndCheckMemberAuth(req.auth, capability)
                        }
                        return
                    }

                    default: throw new Errors.UnauthorizedError()
                }
            })().asCallback(next)
        }
    }

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
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {

        return (async (): Bluebird<Express.Response> => {
            const userId = req.params.user_id

            const result = await modelsFactory.userModel.findById(userId)
            
            if (result) {
                return res.json(result) 
            }

            throw new Errors.NotFoundError(ModelTypes.userName, userId)
        })().asCallback(next)
    })

    app.patch('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        checkAuth(Capability.Edit),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const userId = req.params.user_id
        
            const result = await modelsFactory.userModel
                .findById(userId)

            if (!result) {
                throw new Errors.NotFoundError(ModelTypes.userName, userId)
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
        checkAuth(Capability.Delete),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const userId = req.params.user_id

            const result = await modelsFactory.userModel.destroy({
                where: {
                    id: userId
                }
            })
            
            if (result === 1) {
                return res.sendStatus(200)
            }

            throw new Errors.NotFoundError(ModelTypes.userName, userId)
        })().asCallback(next)
    })
}