import Express from 'express';
import Validator from 'express-validator/check'
import * as Models from '../models'
import * as Middleware from '../helpers/middleware'
import { isNullOrUndefined } from 'util';
import {Role, Capabilities} from '../roles'
import * as Errors from '../helpers/errors'

export function initSurveysController(app: Express.Express, modelsFactory: Models.Factory) {
    
    //add authentication. user and org in auth
    app.post('/surveys', [
        Validator.body('creator_id').isInt({gt: 0}),
        Validator.body('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const member = await modelsFactory.memberModel.findOne({
            where: {
                user_id: req.body.creator_id,
                organization_id: req.body.organization_id
            }
        })

        if (!member) {
            return next(new Errors.NotFoundError('member'))
        }

        const role = Role.findByRoleId(member.role_id)

        if (!role.capabilities.get(Capabilities.Create)) {
            return next(new Errors.ForbiddenError(
                'Member not authorized to create survey'
            ))
        }

        const result = await modelsFactory.surveyModel.create({
            name: req.body.name, 
            creator_id: req.body.creator_id, 
            organization_id: req.body.organization_id
        })

        return res.json(result)   
    })

    app.get('/surveys', [
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('size').optional().isInt({lt: 101, gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

        const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

        const result = await modelsFactory.surveyModel.findAndCountAll({
            offset: page * limit,
            limit
        })

        return res.json(result) //is total correct?
    })

    app.get('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const surveyId = req.params.survey_id

        const result = await modelsFactory.surveyModel
            .findById(surveyId)

        if (result) {
            return res.json(result) 
        }
        return next(new Errors.NotFoundError(Models.surveyName, surveyId))
    })

    app.patch('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        Validator.body('user_id').isInt({gt: 0}), //HACK. MOVE TO AUTH. FIXME
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const member = await modelsFactory.memberModel.findOne({
            where: {
                user_id: req.body.user_id,
                organization_id: req.body.organization_id
            }
        })

        if (!member) {
            return next(new Errors.NotFoundError('member'))
        }

        const role = Role.findByRoleId(member.role_id)

        if (!role.capabilities.get(Capabilities.Edit)) {

            const permission = await modelsFactory.memberSurveyPermissionModel.findOne({
                where: {
                    user_id: req.body.user_id,
                    survey_id: req.params.survey_id
                }
            })

            if (!permission || !Role.findByRoleId(permission.role_id).capabilities.get(Capabilities.Edit)) {
                return next(new Errors.ForbiddenError(
                    'Member not authorized to edit survey'
                ))
            }
        }
        
        const surveyId = req.params.survey_id

        const result = await modelsFactory.surveyModel
            .findById(surveyId)

        if (!result) {
            return next(new Errors.NotFoundError(Models.surveyName, surveyId))
        }

        if (result.name === req.body.name) {
            return res.json(result) 
        }

        await result.update({name: req.body.name})

        return res.json(result) 
    })

    app.delete('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('user_id').isInt({gt: 0}), //HACK. MOVE TO AUTH. FIXME
        Middleware.validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response, next: Function) => {
        const member = await modelsFactory.memberModel.findOne({
            where: {
                user_id: req.body.creator_id,
                organization_id: req.body.organization_id
            }
        })

        if (!member) {
            return next(new Errors.NotFoundError('member'))
        }

        const role = Role.findByRoleId(member.role_id)

        if (!role.capabilities.get(Capabilities.Delete)) {
            const permission = await modelsFactory.memberSurveyPermissionModel.findOne({
                where: {
                    user_id: req.body.user_id,
                    survey_id: req.params.survey_id
                }
            })

            if (!permission || !Role.findByRoleId(permission.role_id).capabilities.get(Capabilities.Delete)) {
                return next(new Errors.ForbiddenError(
                    'Member not authorized to delete survey'
                ))
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

        return next(new Errors.NotFoundError(Models.surveyName, surveyId))
    })
}