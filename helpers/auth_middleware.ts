
import Express from 'express';
import Factory from '../models/factory'
import * as Errors from './errors'
import {Role, Capability} from '../roles'
import Bluebird from 'bluebird'

export default function makeAuthMiddleware(modelsFactory: Factory) {

    return {

        checkUserAuth2 (req: Express.Request, res: Express.Response, next: Function) {

            return (async (): Bluebird<void> => {
                switch (req.auth.type) {
                    case 'user': {
                        this.checkUserAuth(req.auth, req.params.user_id) 
                        return
                    }
                    default: throw new Errors.UnauthorizedError()
                }
            })().asCallback()
        },

        checkUserAuth (auth: UserAuth, userId: number) {
            if (auth.id !== userId) {
                throw new Errors.UnauthorizedError()
            }
        },

        async getMemberAuth(auth: MemberAuth) {
            const member = await modelsFactory.memberModel.findOne({
                where: {
                    user_id: auth.id,
                    organization_id: auth.organization_id
                }
            })

            if (!member) {
                throw new Errors.NotFoundError('member')
            }

            return member
        },

        async checkMemberAuth (auth: MemberAuth, capability: Capability) {
            const member = await this.getMemberAuth(auth)

            if (!Role.findByRoleId(member.role_id).capabilities.has(capability)) {
                throw new Errors.ForbiddenError('member cannot edit user')
            }

            return member
        },

        async checkUserMemberAuth (auth: MemberAuth, userId: number, capability: Capability) {
            if (userId && auth.id !== userId) {
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

        async checkMemberSurveyAuth (auth: MemberAuth, surveyId: number, capability: Capability) {
            const member = await this.getMemberAuth(auth)

            if (!Role.findByRoleId(member.role_id).capabilities.has(capability)) {

                const permission = await modelsFactory.memberSurveyPermissionModel.findOne({
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
        },

        // checkAllAuth (capability: Capability) {
        //     return (req: Express.Request, res: Express.Response, next: Function) => {
          
        //         return (async (): Bluebird<void> => {
        //             switch (req.auth.type) {
        //                 case 'none': throw new Errors.UnauthorizedError()

        //                 case 'user': {
        //                     this.checkUserAuth(req.auth, req.params.user_id)
        //                     return
        //                 }

        //                 case 'member': await this.checkMemberAuth(req.auth, req.params.user_id, capability)
        //             }
        //         })().asCallback()
        //     }
    }
}