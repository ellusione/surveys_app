
import Express from 'express';
import Bluebird from 'bluebird'
import * as Model from '../models'
import * as jwt from 'jsonwebtoken'
import * as Errors from './errors'
import * as config from '../config'
import {Role, Capability} from '../roles'

export default function makeAuthMiddleware(modelsFactory: Model.Factory) {

    return {
        parseAuthHeader (
            req: Express.Request, res: Express.Response, next: Function
        ) {
            return (async (): Bluebird<Express.Response> => {
                const token = req.headers['x-access-token'];

                if (!token) {
                    req.auth = {type: 'none'}
                    return next()
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
                    return next()
                }

                if (typeof organization_id !== 'number') {
                    throw new Errors.UnauthorizedError('invalid token format')
                }

                req.auth = {type: 'member', id, organization_id}
                return next()
            })().asCallback(next)
        },

        checkUserAuth (auth: UserAuth, userId: number) {
            if (auth.id !== userId) {
                throw new Errors.UnauthorizedError()
            }
        },

        async checkMemberAuth (auth: MemberAuth, userId: number, capability: Capability) {
            if (auth.id !== userId) {
                const member = await modelsFactory.memberModel.findOne({
                    where: {
                        user_id: auth.id,
                        organization_id: auth.organization_id
                    }
                })

                if (!member) {
                    throw new Errors.NotFoundError('member')
                }

                if (!Role.findByRoleId(member.role_id).capabilities.has(capability)) {
                    throw new Errors.ForbiddenError('member cannot edit user')
                }
            }
        },

        checkAllAuth (capability: Capability) {
            return (req: Express.Request, res: Express.Response, next: Function) => {
          
                return (async (): Bluebird<void> => {
                    switch (req.auth.type) {
                        case 'none': throw new Errors.UnauthorizedError()

                        case 'user': {
                            this.checkUserAuth(req.auth, req.params.user_id)
                            return
                        }

                        case 'member': await this.checkMemberAuth(req.auth, req.params.user_id, capability)
                    }
                })().asCallback()
            }
        }
    }
}