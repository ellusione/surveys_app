import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import Factory from '../models/factory'
import * as ModelTypes from '../models'
import ResourcesMiddleware from '../middleware/resources';
import AuthMiddleware from '../middleware/auth';
import * as Middleware from '../middleware'
import {Role, Capability} from '../roles'
import * as Errors from '../errors'

export function initMemberSurveyPermissionController(
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
                        const member = await authMiddleware.getAndCheckMemberAuth(req.auth, capability)

                        if (member.organization_id !== res.locals.survey.organization_id) {
                            throw new Errors.UnauthorizedError()
                        }
                        res.locals.auth_member = member
                        return
                    }

                    default: throw new Errors.UnauthorizedError()
                }
            })().asCallback(next)
        }
    }

    app.post('/surveys/:survey_id/member_permissions', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('user_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        resourcesMiddleware.loadSurvey,
        checkAuth(Capability.Edit),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const survey = <ModelTypes.SurveyInstance> res.locals.survey

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
        Validator.body('user_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const result = await modelsFactory.memberSurveyPermissionModel.findAll({
                where: {
                    survey_id: req.params.survey_id,
                    user_id: req.body.user_id
                }
            })

            return res.json(result) 
        })().asCallback(next)
    })

    app.delete('/surveys/:survey_id/member_permissions', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('user_id').isInt({gt: 0}),
        Validator.body('role_id').optional().isInt({gt: 0, lt: Role.allRoles.size+1}),
        resourcesMiddleware.loadSurvey,
        checkAuth(Capability.Delete),
        Middleware.validationErrorHandlingFn  
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