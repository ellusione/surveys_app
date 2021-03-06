import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import * as Factory from '../models/factory'
import * as Errors from '../errors'
import * as Middleware from '../middleware';
import * as config from '../config'

export function initTokensController(
    app: Express.Express, 
    modelsFactory: Factory.Models, 
    middleware: Middleware.Middleware
) {

    app.post('/user_tokens', [
        Validator.body('username').isString(),
        Validator.body('password').isString(),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = await modelsFactory.userModel.scope('withCredentials').findOne({
                where: {
                    username: req.body.username
                }
            })

            if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
                throw new Errors.UnauthorizedError()
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
        Validator.body('organization_id').isInt({gt: 0}),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            if (req.auth.type !== 'user') {
                throw new Errors.UnauthorizedError('unexpected token')
            }

            const member = await modelsFactory.memberModel.findOne({
                where: {
                    user_id: req.auth.id,
                    organization_id: req.body.organization_id
                }
            })

            if (!member) {
                throw new Errors.UnauthorizedError()
            }

            const token = jwt.sign({
                id: req.auth.id,
                organization_id: req.body.organization_id
            }, config.AUTH_TOKENS.secret, {
                expiresIn: 86400
            })
    
            return res.json(token)
        })().asCallback(next)
    })
}