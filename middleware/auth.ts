
import Bluebird from 'bluebird'
import Express from 'express'
import Factory from '../models/factory'
import * as Errors from '../errors'
import {Role, Capability} from '../roles'
import jwt from 'jsonwebtoken'
import * as config from '../config'

export default class AuthMiddleware {
    modelsFactory: Factory
    constructor (modelsFactory: Factory) {
        this.modelsFactory = modelsFactory
    }

    private async getMemberAuth(auth: MemberAuth) {
        const member = await this.modelsFactory.memberModel.findOne({
            where: {
                user_id: auth.id,
                organization_id: auth.organization_id
            }
        })

        if (!member) {
            throw new Errors.NotFoundError('member')
        }

        return member
    }

    parseAuthHeader (
        req: Express.Request, res: Express.Response, next: Function
    ) {
        return (async (): Bluebird<void> => {
            const token = req.headers['x-access-token'];
    
            if (!token) {
                req.auth = {type: 'none'}
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

    async getAndCheckMemberAuth (auth: MemberAuth, capability: Capability) {
        const member = await this.getMemberAuth(auth)

        if (!Role.findByRoleId(member.role_id).capabilities.has(capability)) {
            throw new Errors.ForbiddenError('member cannot edit user')
        }

        return member
    }

    async getAndCheckMemberSurveyAuth (auth: MemberAuth, surveyId: number, capability: Capability) {
        const member = await this.getMemberAuth(auth)

        if (!Role.findByRoleId(member.role_id).capabilities.has(capability)) {

            const permission = await this.modelsFactory.memberSurveyPermissionModel.findOne({
                where: {
                    user_id: member.user_id,
                    survey_id: surveyId
                }
            })

            if (!permission || !Role.findByRoleId(permission.role_id).capabilities.get(Capability.Edit)) {
                throw new Errors.ForbiddenError(
                    'Member not authorized to edit survey'
                )
            }
        }

        return member
    }
}