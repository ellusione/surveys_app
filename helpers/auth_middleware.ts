
import Factory from '../models/factory'
import * as Errors from './errors'
import {Role, Capability} from '../roles'

export default function makeAuthMiddleware(modelsFactory: Factory) {

    async function getMemberAuth(auth: MemberAuth) {
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
    }

    return {

        async getAndCheckMemberAuth (auth: MemberAuth, capability: Capability) {
            const member = await getMemberAuth(auth)

            if (!Role.findByRoleId(member.role_id).capabilities.has(capability)) {
                throw new Errors.ForbiddenError('member cannot edit user')
            }

            return member
        },


        async getAndCheckMemberSurveyAuth (auth: MemberAuth, surveyId: number, capability: Capability) {
            const member = await getMemberAuth(auth)

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
        }
    }
}