
import Bluebird from 'bluebird'
import Express from 'express'
import Factory from '../../models/factory'
import * as Errors from '../../errors'
import {Role, Capability} from '../../roles'
import {GetAuth} from './get'
import {GetResource} from '../resource/get'

export default class VerifyAuthCapability {
    modelsFactory: Factory
    constructor (modelsFactory: Factory) {
        this.modelsFactory = modelsFactory
    }

    verifyMember(capability: Capability) {
        return (
            req: Express.Request, res: Express.Response, next: Function
        ) => {
            if (!Role.findByRoleId(GetAuth.getAuthMember(req).role_id).capabilities.has(capability)) {
                return next(new Errors.ForbiddenError())
            }
            return next()
        }
    }

    verifyMemberSurvey(capability: Capability) {
        return (
            req: Express.Request, res: Express.Response, next: Function
        ) => {
            return (async (): Bluebird<void> => {
                const member = GetAuth.getAuthMember(req)
                const survey = GetResource.getSurvey(req)

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
}