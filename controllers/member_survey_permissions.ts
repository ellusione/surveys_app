import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as Models from '../models'
import * as Middleware from '../helpers/middleware'
import makeAuthMiddleware from '../helpers/auth_middleware'
import {Role} from '../roles'
import * as Errors from '../helpers/errors'

export function initMemberSurveyPermissionController(app: Express.Express, modelsFactory: Models.Factory) {
    const authMiddleware = makeAuthMiddleware(modelsFactory)
    
    app.post('/surveys/:survey_id/users/:user_id/permissions', [
        Middleware.checkRequiredAuth,
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.param('user_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const surveyId = req.body.survey_id
            const survey = await modelsFactory.surveyModel.findById(req.body.survey_id)

            if (!survey) {
                throw new Errors.NotFoundError(Models.surveyName, surveyId)
            }

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
                    survey_id: req.body.survey_id,
                    user_id: req.body.user_id,
                    role_id: req.body.role_id
                })

            return res.json(result) 
        })().asCallback(next)
    })
    
    app.get('/surveys/:survey_id/users/:user_id/permissions', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.param('user_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const result = await modelsFactory.memberSurveyPermissionModel.findAll({
                where: {
                    survey_id: req.body.survey_id,
                    user_id: req.body.user_id
                }
            })

            return res.json(result) 
        })().asCallback(next)
    })

    app.delete('/surveys/:survey_id/users/:user_id/permissions', [
        Middleware.checkRequiredAuth,
        Validator.body('role_id').optional().isInt({gt: 0, lt: Role.allRoles.size+1}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {

        return (async (): Bluebird<Express.Response> => {
            if (req.body.role_id) {
                await modelsFactory.memberSurveyPermissionModel 
                    .destroy({
                        where: {
                            survey_id: req.body.survey_id,
                            user_id: req.body.user_id,
                            role_id: req.body.role_id
                        }
                    })

                return res.json('success')
            }

            await modelsFactory.memberSurveyPermissionModel 
                .destroy({
                    where: {
                        survey_id: req.body.survey_id,
                        user_id: req.body.user_id
                    }
                })

            return res.json('success')
        })().asCallback(next)
    })

}