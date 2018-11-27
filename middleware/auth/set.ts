
import Bluebird from 'bluebird'
import Express from 'express'
import Factory from '../../models/factory'
import * as Errors from '../../errors'
import jwt from 'jsonwebtoken'
import * as config from '../../config'

export default class AuthSetter {
    modelsFactory: Factory
    constructor (modelsFactory: Factory) {
        this.modelsFactory = modelsFactory
    }

    parseAuthHeader (
        req: Express.Request, res: Express.Response, next: Function
    ) {
        return (async (): Bluebird<void> => {
            const token = req.headers['x-access-token'];
    
            if (!token) {
                return
            }
    
            if (typeof token !== 'string') {
                throw new Errors.UnauthorizedError('invalid token format')
            }
    
            let auth: any
            try {
                auth = jwt.verify(token, config.AUTH_TOKENS.secret)
            } catch (err) {
                const error = <Error>err
                throw new Errors.UnauthorizedError(error.message)
            }
    
            if (typeof auth !== 'object') {
                throw new Errors.UnauthorizedError('invalid token format')
            }
    
            const id = auth['id']
            const organization_id = auth['organization_id']
    
            if (!id || typeof id !== 'number') {
                throw new Errors.UnauthorizedError('invalid token format')
            }
    
            if (!organization_id) {
                req.auth = {type: 'user', id}
                return
            }
    
            if (typeof organization_id !== 'number') {
                throw new Errors.UnauthorizedError('invalid token format')
            }
    
            req.auth = {type: 'member', id, organization_id}
            return
        })().asCallback(next)
    }

    setEitherAuth(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        switch (req.auth.type) {
            case 'user': return this.setAuthUser(req, res, next)
            case 'member': return this.setAuthMember(req, res, next)
            default: throw new Errors.UnauthorizedError()
        }
    }

    setAuthUser(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        return (async (): Bluebird<void> => {
            if (req.auth.type !== 'user') {
                throw new Errors.UnauthorizedError()
            }
            const user = await this.modelsFactory.userModel.findById(req.auth.id)

            if (!user) {
                throw new Errors.UnauthorizedError()
            }

            req.auth.instance = user
        })().asCallback(next)
    }

    setAuthMember(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        return (async (): Bluebird<void> => {
            if (req.auth.type !== 'member') {
                throw new Errors.UnauthorizedError()
            }
            const member = await this.modelsFactory.memberModel.findOne({
                where: {
                    user_id: req.auth.id,
                    organization_id: req.auth.organization_id
                }
            })

            if (!member) {
                throw new Errors.UnauthorizedError()
            }

            req.auth.instance = member
        })().asCallback(next)
    }
}