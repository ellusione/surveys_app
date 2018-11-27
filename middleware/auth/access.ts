import Express from 'express'
import * as Errors from '../../errors'
import {Auth} from './get'
import {Resource} from '../resource/get'

export class AuthAccess {

    static verifyEitherAuthAccessOfUser(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        switch (req.auth.type) {
            case 'user': return AuthAccess.verifyAccessOfUser(req, res, next)
            case 'member': return AuthAccess.verifyMemberAccessOfUser(req, res, next)
            default: return next(new Errors.UnauthorizedError())
        }
    }

    private static verifyAccessOfUser(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const user = Auth.getUser(req)
            const requestedUser = Resource.getUser(req)

            if (user.id !== requestedUser.id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }
        return next()
    }

    private static verifyMemberAccessOfUser(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const member = Auth.getMember(req)
            const requestedUser = Resource.getUser(req)

            if (member.user_id !== requestedUser.id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }

        return next()
    }

    static verifyMemberAccessOfSurvey(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const member = Auth.getMember(req)
            const survey = Resource.getSurvey(req)

            if (member.organization_id !== survey.organization_id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }
        return next()
    }

    static verifyAccessOfMember(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const member = Auth.getMember(req)
            const requestedMember = Resource.getMember(req)

            if (member.organization_id !== requestedMember.organization_id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }
        return next()
    }

    static verifyMemberAccessOfOrganization(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const member = Auth.getMember(req)
            const organization = Resource.getOrganization(req)

            if (member.organization_id !== organization.id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }

        return next()
    }
}