import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as Models from '../models'
import * as Middleware from '../helpers/middleware'
import makeAuthMiddleware from '../helpers/auth_middleware'
import { isNullOrUndefined } from 'util';
import {Role, Capability} from '../roles'
import * as Errors from '../helpers/errors'

export function initSurveysController(app: Express.Express, modelsFactory: Models.Factory) {
    const authMiddleware = makeAuthMiddleware(modelsFactory)

    app.post('/surveys', [
        Validator.body('creator_id').isInt({gt: 0}),
        Validator.body('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const member = await modelsFactory.memberModel.findOne({
                where: {
                    user_id: req.body.creator_id,
                    organization_id: req.body.organization_id
                }
            })

            if (!member) {
                throw new Errors.NotFoundError('member')
            }

            const role = Role.findByRoleId(member.role_id)

            if (!role.capabilities.get(Capability.Create)) {
                throw new Errors.ForbiddenError(
                    'Member not authorized to create survey'
                )
            }

            const result = await modelsFactory.surveyModel.create({
                name: req.body.name, 
                creator_id: req.body.creator_id, 
                organization_id: req.body.organization_id
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
                offset: page * limit,
                limit
            })

            return res.json(result) 
        })().asCallback(next)
    })

    app.get('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const surveyId = req.params.survey_id

            const result = await modelsFactory.surveyModel
                .findById(surveyId)

            if (result) {
                return res.json(result) 
            }
            throw new Errors.NotFoundError(Models.surveyName, surveyId)
        })().asCallback(next)
    })

    app.patch('/surveys/:survey_id', [
        Middleware.checkRequiredAuth,
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        Validator.body('user_id').isInt({gt: 0}), //HACK. MOVE TO AUTH. FIXME
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const member = await modelsFactory.memberModel.findOne({
                where: {
                    user_id: req.body.user_id,
                    organization_id: req.body.organization_id
                }
            })

            if (!member) {
                throw new Errors.NotFoundError('member')
            }

            const role = Role.findByRoleId(member.role_id)

            if (!role.capabilities.get(Capability.Edit)) {

                const permission = await modelsFactory.memberSurveyPermissionModel.findOne({
                    where: {
                        user_id: req.body.user_id,
                        survey_id: req.params.survey_id
                    }
                })

                if (!permission || !Role.findByRoleId(permission.role_id).capabilities.get(Capability.Edit)) {
                    throw new Errors.ForbiddenError(
                        'Member not authorized to edit survey'
                    )
                }
            }
        
            const surveyId = req.params.survey_id

            const result = await modelsFactory.surveyModel
                .findById(surveyId)

            if (!result) {
                throw new Errors.NotFoundError(Models.surveyName, surveyId)
            }

            if (result.name === req.body.name) {
                return res.json(result) 
            }

            await result.update({name: req.body.name})

            return res.json(result) 
        })().asCallback(next)
    })

    app.delete('/surveys/:survey_id', [
        Middleware.checkRequiredAuth,
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('user_id').isInt({gt: 0}), //HACK. MOVE TO AUTH. FIXME
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const member = await modelsFactory.memberModel.findOne({
                where: {
                    user_id: req.body.creator_id,
                    organization_id: req.body.organization_id
                }
            })

            if (!member) {
                throw new Errors.NotFoundError('member')
            }

            const role = Role.findByRoleId(member.role_id)

            if (!role.capabilities.get(Capability.Delete)) {
                const permission = await modelsFactory.memberSurveyPermissionModel.findOne({
                    where: {
                        user_id: req.body.user_id,
                        survey_id: req.params.survey_id
                    }
                })

                if (!permission || !Role.findByRoleId(permission.role_id).capabilities.get(Capability.Delete)) {
                    throw new Errors.ForbiddenError(
                        'Member not authorized to delete survey'
                    )
                }
            }

            const surveyId = req.params.survey_id

            const result = await modelsFactory.surveyModel
                .destroy({
                    where: {
                        id: surveyId
                    }
                })

            if (result === 1) {
                return res.status(200)
            }

            throw new Errors.NotFoundError(Models.surveyName, surveyId)
        })().asCallback(next)
    })
}