import Express from 'express'
import * as Errors from '../../errors'
import {GetAuth} from './get'
import {GetResource} from '../resource/get'

export class VerifyAuthAccess {

    static verifyEitherAuthAccessOfUser(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        switch (req.auth.type) {
            case 'user': return VerifyAuthAccess.verifyAccessOfUser(req, res, next)
            case 'member': return VerifyAuthAccess.verifyMemberAccessOfUser(req, res, next)
            default: return next(new Errors.UnauthorizedError())
        }
    }

    private static verifyAccessOfUser(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        try {
            const user = GetAuth.getAuthUser(req)
            const requestedUser = GetResource.getUser(req)

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
            const member = GetAuth.getAuthMember(req)
            const requestedUser = GetResource.getUser(req)

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
            const member = GetAuth.getAuthMember(req)
            const survey = GetResource.getSurvey(req)

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
            const member = GetAuth.getAuthMember(req)
            const requestedMember = GetResource.getMember(req)

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
            const member = GetAuth.getAuthMember(req)
            const organization = GetResource.getOrganization(req)

            if (member.organization_id !== organization.id) {
                throw new Errors.UnauthorizedError()
            }
        } catch (err) {
            return next(err)
        }

        return next()
    }
}