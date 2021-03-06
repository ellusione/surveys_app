import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import { isNullOrUndefined } from 'util';
import * as Factory from '../models/factory'
import * as Middleware from '../middleware';
import {Role, Capability} from '../roles'
import * as Errors from '../errors'


export function initMemberSurveyPermissionController(
    app: Express.Express, 
    modelsFactory: Factory.Models, 
    middleware: Middleware.Middleware
) {

    app.post('/surveys/:survey_id/member_permissions', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('user_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        middleware.resourceLoader.loadSurvey.bind(middleware.resourceLoader),
        middleware.authSetter.setMember.bind(middleware.authSetter),
        Middleware.AuthAccess.verifyMemberAccessOfSurvey,
        middleware.authCapability.verifyMember(Capability.Edit).bind(middleware.authCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const survey = Middleware.Resource.getSurvey(req)

            const member = await modelsFactory.memberModel.findOne({
                where: {
                    user_id: req.body.user_id,
                    organization_id: survey.organization_id
                }
            })

            if (!member) {
                throw new Errors.ForbiddenError('User is not a member of the required organization')
            }

            if (member.role_id > req.body.role_id) {
                throw new Errors.BadRequestError('Detected incorrect user permission')
            }

            const result = await modelsFactory.memberSurveyPermissionModel 
                .create({
                    survey_id: req.params.survey_id,
                    user_id: req.body.user_id,
                    role_id: req.body.role_id
                })

            return res.json(result) 
        })().asCallback(next)
    })
    
    app.get('/surveys/:survey_id/member_permissions', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('size').optional().isInt({lt: 101, gt: 0}),
        Validator.query('user_id').optional().isInt({gt: 0}),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {

            const surveyId = req.params.survey_id
            const userId = req.query.user_id

            const whereCondition = userId ? {survey_id: surveyId, user_id: userId} : {survey_id: surveyId}

            const page = isNullOrUndefined(req.query.page) ? 1 : req.query.page

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const offset = Middleware.Base.calculatePaginationOffset(page, limit)

            const result = await modelsFactory.memberSurveyPermissionModel.findAll({
                where: whereCondition,
                offset,
                limit
            })

            return res.json(result)  //but should be single response for 1 user! what to do.
        })().asCallback(next)
    })

    app.delete('/surveys/:survey_id/member_permissions', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('user_id').isInt({gt: 0}),
        Validator.body('role_id').optional().isInt({gt: 0, lt: Role.allRoles.size+1}),
        middleware.resourceLoader.loadSurvey.bind(middleware.resourceLoader),
        middleware.authSetter.setMember.bind(middleware.authSetter),
        Middleware.AuthAccess.verifyMemberAccessOfSurvey,
        middleware.authCapability.verifyMember(Capability.Delete).bind(middleware.authCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {

        return (async (): Bluebird<Express.Response> => {
            if (req.body.role_id) {
                await modelsFactory.memberSurveyPermissionModel 
                    .destroy({
                        where: {
                            survey_id: req.params.survey_id,
                            user_id: req.body.user_id,
                            role_id: req.body.role_id
                        }
                    })

                return res.json('success')
            }

            await modelsFactory.memberSurveyPermissionModel 
                .destroy({
                    where: {
                        survey_id: req.params.survey_id,
                        user_id: req.body.user_id
                    }
                })

            return res.json('success')
        })().asCallback(next)
    })

}