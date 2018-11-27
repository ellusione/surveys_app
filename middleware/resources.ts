import Express from 'express';
import Factory from '../models/factory'
import * as ModelTypes from '../models'
import Bluebird from 'bluebird'
import * as Errors from '../errors'


export default class Middleware {
    modelsFactory: Factory

    constructor (modelsFactory: Factory) {
        this.modelsFactory = modelsFactory
    }

    loadUser (req: Express.Request, res: Express.Response, next: Function) {
        return (async (): Bluebird<void> => {
            const userId = req.params.user_id
            const user = await this.modelsFactory.userModel.findById(userId)

            if (!user) {
                throw new Errors.NotFoundError(ModelTypes.userName, userId)
            }
            res.customLocals = {
                type: 'user',
                resource: user
            }
        })().asCallback(next)
    }

    loadSurvey (req: Express.Request, res: Express.Response, next: Function) {
        return (async (): Bluebird<void> => {
            const surveyId = req.params.survey_id
            const survey = await this.modelsFactory.surveyModel.findById(surveyId)

            if (!survey) {
                throw new Errors.NotFoundError(ModelTypes.surveyName, surveyId)
            }

            res.customLocals = {
                type: 'survey',
                resource: survey
            }
        })().asCallback(next)
    }

    loadOrganization (req: Express.Request, res: Express.Response, next: Function) {
        return (async (): Bluebird<void> => {
            const organizationId = req.params.organization_id
            const organization = await this.modelsFactory.organizationModel.findById(organizationId)

            if (!organization) {
                throw new Errors.NotFoundError(ModelTypes.organizationName, organizationId)
            }

            res.customLocals = {
                type: 'organization',
                resource: organization
            }
        })().asCallback(next)
    }

    loadMember (req: Express.Request, res: Express.Response, next: Function) {
        return (async (): Bluebird<void> => {
            const memberId = req.params.member_id
            const member = await this.modelsFactory.memberModel.findById(memberId)

            if (!member) {
                throw new Errors.NotFoundError(ModelTypes.memberName, memberId)
            }

            res.customLocals = {
                type: 'member',
                resource: member
            }
        })().asCallback(next)
    }
}
