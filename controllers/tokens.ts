import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import * as Models from '../models'
import * as Errors from '../helpers/errors'
import * as Middleware from '../helpers/middleware'
import * as config from '../config'

enum TOKEN_TYPES {
    User,
    Member
}

export function initTokensController(app: Express.Express, modelsFactory: Models.Factory) {

    app.post('/user_tokens', [
        Validator.body('username').isString(),
        Validator.body('password').isString(),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = await modelsFactory.userModel.findOne({
                where: {
                    username: req.body.username
                }
            })

            if (!user) {
                throw new Errors.NotFoundError('user')
            }

            if (!bcrypt.compareSync(req.body.password, user.password)) {
                throw new Errors.ForbiddenError('invalid password')
            }

            const token = jwt.sign({
                id: user.id
            }, config.AUTH_TOKENS.secret, {
                expiresIn: 86400
            })
    
            return res.json(token)
        })().asCallback(next)
    })

    app.post('/member_tokens', [
        Middleware.checkRequiredAuth,
        Validator.body('username').isString(),
        Validator.body('password').isString(),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = await modelsFactory.userModel.findOne({
                where: {
                    username: req.body.username
                }
            })

            if (!user) {
                throw new Errors.NotFoundError('user')
            }

            if (!bcrypt.compareSync(req.body.password, user.password)) {
                throw new Errors.ForbiddenError('invalid password')
            }

            const token = jwt.sign({
                type: TOKEN_TYPES.User,
                id: req.body.id
            }, config.AUTH_TOKENS.secret, {
                expiresIn: 86400
            })
    
            return res.json(token)
        })().asCallback(next)
    })
}