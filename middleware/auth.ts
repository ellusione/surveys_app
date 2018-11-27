
import Bluebird from 'bluebird'
import Express from 'express'
import Factory from '../models/factory'
import * as Errors from '../errors'
import {Role, Capability} from '../roles'
import jwt from 'jsonwebtoken'
import * as config from '../config'
import * as Middleware from './';


export default class AuthMiddleware {
    modelsFactory: Factory
    constructor (modelsFactory: Factory) {
        this.modelsFactory = modelsFactory
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

    verifyEitherAuthAccessOfUser (capability: Capability) {
        return (
            req: Express.Request, res: Express.Response, next: Function
        ) => {
            switch (req.auth.type) {
                case 'user': return this.verifyAccessOfUser(req, res, next)
                case 'member': return this.verifyMemberAccessOfUser(capability)(req, res, next)
                default: return next(new Errors.UnauthorizedError())
            }
        }
    }

    verifyMemberAccessOfSurvey(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const member = Middleware.getAuthMember(req)
            const survey = Middleware.getSurvey(req)

            if (member.organization_id !== survey.organization_id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }
        return next()
    }

    private verifyMemberAccessOfUser(capability: Capability) {
        return (
            req: Express.Request, res: Express.Response, next: Function
        ) => {
            try {
                const member = Middleware.getAuthMember(req)
                const requestedUser = Middleware.getUser(req)

                if (member.user_id !== requestedUser.id) {
                    throw new Errors.UnauthorizedError()
                }
            } catch (err) {
                return next(err)
            }

            return next()
        }
    }

    private verifyAccessOfUser(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const user = Middleware.getAuthUser(req)
            const requestedUser = Middleware.getUser(req)

            if (user.id !== requestedUser.id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }
        return next()
    }

    verifyAccessOfMember(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const member = Middleware.getAuthMember(req)
            const requestedMember = Middleware.getMember(req)

            if (member.organization_id !== requestedMember.organization_id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }
        return next()
    }

    verifyMemberAccessOfOrganization(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const member = Middleware.getAuthMember(req)
            const organization = Middleware.getOrganization(req)

            if (member.organization_id !== organization.id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }

        return next()
    }

    verifyAuthMemberCapability(capability: Capability) {
        return (
            req: Express.Request, res: Express.Response, next: Function
        ) => {
            if (!Role.findByRoleId(Middleware.getAuthMember(req).role_id).capabilities.has(capability)) {
                return next(new Errors.ForbiddenError())
            }
            return next()
        }
    }

    verifyAuthMemberSurveyCapability(capability: Capability) {
        return (
            req: Express.Request, res: Express.Response, next: Function
        ) => {
            return (async (): Bluebird<void> => {
                const member = Middleware.getAuthMember(req)
                const survey = Middleware.getSurvey(req)

                if (!Role.findByRoleId(member.role_id).capabilities.has(capability)) {

                    const permission = await this.modelsFactory.memberSurveyPermissionModel.findOne({
                        where: {
                            user_id: member.user_id,
                            survey_id: survey.id
                        }
                    })
        
                    if (!permission || !Role.findByRoleId(permission.role_id).capabilities.get(capability)) {
                        throw new Errors.ForbiddenError(
                            'Member not authorized to alter survey'
                        )
                    }
                }
            })().asCallback(next)
        }
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
}