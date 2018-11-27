import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import Factory from '../models/factory'
import * as Middleware from '../middleware';
import { isNullOrUndefined } from 'util';
import {Capability} from '../roles'
import * as Errors from '../errors'

export function initSurveysController(
    app: Express.Express, 
    modelsFactory: Factory, 
    middleware: Middleware.Middleware
) {

    app.post('/surveys', [
        Validator.body('name').isString(),
        middleware.SetAuth.setAuthMember.bind(middleware.SetAuth),
        middleware.VerifyAuthCapability.verifyMember(Capability.Create).bind(middleware.VerifyAuthCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const member = Middleware.GetAuth.getAuthMember(req)

            const result = await modelsFactory.surveyModel.create({
                name: req.body.name, 
                creator_id: member.user_id, 
                organization_id: member.organization_id
            })

            return res.json(result)   
        })().asCallback(next)
    })

    app.get('/surveys', [
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('size').optional().isInt({lt: 101, gt: 0}),
        Validator.query('organization_id').optional().isInt({gt: 0}),
        Validator.query('creator_id').optional().isInt({gt: 0}),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const creatorId = req.query.creator_id

            const organizationId = req.query.organization_id

            if (creatorId && organizationId) { //move to validation chain?
                throw new Errors.BadRequestError('cannot include both creator_id and organization_id in query')
            }

            const whereCondition = creatorId ? {creator_id: creatorId} : (organizationId ? {organization_id: organizationId} : null)

            const page = isNullOrUndefined(req.query.page) ? 1 : req.query.page //have default pagination settings in config

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const offset = Middleware.Base.calculatePaginationOffset(page, limit)

            const result = await modelsFactory.surveyModel.findAndCountAll(
                whereCondition ? {
                    where: whereCondition,
                    offset,
                    limit
                } : {
                offset,
                limit
            })

            return res.json(result) 
        })().asCallback(next)
    })

    app.get('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        middleware.LoadResource.loadSurvey.bind(middleware.LoadResource),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        return res.json(Middleware.GetResource.getSurvey(req)) 
    })

    app.patch('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        middleware.LoadResource.loadSurvey.bind(middleware.LoadResource),
        middleware.SetAuth.setAuthMember.bind(middleware.SetAuth),
        Middleware.VerifyAuthAccess.verifyMemberAccessOfSurvey,
        middleware.VerifyAuthCapability.verifyMemberSurvey(Capability.Edit).bind(middleware.VerifyAuthCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const survey = Middleware.GetResource.getSurvey(req)

            if (survey.name === req.body.name) {
                return res.json(survey) 
            }

            await survey.update({name: req.body.name})

            return res.json(survey)
        })().asCallback(next)
    })

    app.delete('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        middleware.LoadResource.loadSurvey.bind(middleware.LoadResource),
        middleware.SetAuth.setAuthMember.bind(middleware.SetAuth),
        Middleware.VerifyAuthAccess.verifyMemberAccessOfSurvey,
        middleware.VerifyAuthCapability.verifyMemberSurvey(Capability.Delete).bind(middleware.VerifyAuthCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const survey = Middleware.GetResource.getSurvey(req)

            await survey.destroy()

            return res.sendStatus(200)
        })().asCallback(next)
    })
}