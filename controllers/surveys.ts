import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import Factory from '../models/factory'
import * as ModelTypes from '../models'
import ResourcesMiddleware from '../middleware/resources';
import AuthMiddleware from '../middleware/auth';
import * as Middleware from '../middleware'
import { isNullOrUndefined } from 'util';
import {Capability} from '../roles'
import * as Errors from '../errors'

export function initSurveysController(
    app: Express.Express, 
    modelsFactory: Factory, 
    resourcesMiddleware: ResourcesMiddleware, 
    authMiddleware: AuthMiddleware
) {
    function checkAuth (capability: Capability) {
        return (req: Express.Request, res: Express.Response, next: Function) => {

            return (async (): Bluebird<void> => {
                switch (req.auth.type) {
                    case 'member': {
                        res.locals.auth_member = authMiddleware.getAndCheckMemberAuth(req.auth, capability)
                        return
                    }

                    default: throw new Errors.UnauthorizedError()
                }
            })().asCallback(next)
        }
    }

    function checkSurveyAuth (capability: Capability) {
        return (req: Express.Request, res: Express.Response, next: Function) => {

            return (async (): Bluebird<void> => {
                switch (req.auth.type) {
                    case 'member': {
                        res.locals.auth_member = authMiddleware.getAndCheckMemberSurveyAuth(req.auth, res.locals.survey.id, capability)
                        return
                    }

                    default: throw new Errors.UnauthorizedError()
                }
            })().asCallback(next)
        }
    }

    app.post('/surveys', [
        Validator.body('name').isString(),
        checkAuth(Capability.Create),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const member = <ModelTypes.MemberInstance> res.locals.auth_member

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
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const result = await modelsFactory.surveyModel.findAndCountAll({
                offset: Middleware.calculatePaginationOffset(page, limit),
                limit
            })

            return res.json(result) 
        })().asCallback(next)
    })

    app.get('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        resourcesMiddleware.loadSurvey,
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        return res.json(res.locals.survey) 
    })

    app.patch('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        resourcesMiddleware.loadSurvey,
        checkSurveyAuth(Capability.Edit),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const survey = <ModelTypes.SurveyInstance> res.locals.survey

            if (survey.name === req.body.name) {
                return res.json(survey) 
            }

            await survey.update({name: req.body.name})

            return res.json(survey)
        })().asCallback(next)
    })

    app.delete('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        resourcesMiddleware.loadSurvey,
        checkSurveyAuth(Capability.Delete),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const survey = <ModelTypes.SurveyInstance> res.locals.survey

            await survey.destroy()

            return res.sendStatus(200)
        })().asCallback(next)
    })
}