import Express from 'express';
import * as Factory from '../../models/factory'
import * as ModelTypes from '../../models'
import Bluebird from 'bluebird'
import * as Errors from '../../errors'

export default class ResourceLoader {
    modelsFactory: Factory.Models

    constructor (modelsFactory: Factory.Models) {
        this.modelsFactory = modelsFactory
    }

    loadUser (req: Express.Request, res: Express.Response, next: Function) {
        return (async (): Bluebird<void> => {
            const userId = req.params.user_id
            const user = await this.modelsFactory.userModel.findById(userId)

            if (!user) {
                throw new Errors.NotFoundError(ModelTypes.userName, userId)
            }
            req.resource = {
                type: 'user',
                instance: user
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

            req.resource = {
                type: 'survey',
                instance: survey
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

            req.resource = {
                type: 'organization',
                instance: organization
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

            req.resource = {
                type: 'member',
                instance: member
            }
        })().asCallback(next)
    }
}
