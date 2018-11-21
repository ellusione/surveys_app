import Express from 'express';
import Validator from 'express-validator/check'
import ModelsFactory from '../models'
import {validationErrorHandlingFn} from '../helpers/middleware'
import { isNullOrUndefined } from 'util';
import {Role, Capabilities} from '../roles'

export default function initSurveysController(app: Express.Express, modelsFactory: ModelsFactory) {
    
    //add authentication. user and org in auth
    app.post('surveys', [
        Validator.body('creator_id').isInt({gt: 0}),
        Validator.body('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const member = await modelsFactory.memberModel.findOne({
            where: {
                user_id: req.body.creator_id,
                organization_id: req.body.organization_id
            }
        })

        if (!member) {
            return res.status(404).send('Member does not exist')
        }

        const role = Role.findByRoleId(member.role_id)

        if (!role.capabilities.get(Capabilities.Create)) {
            return res.status(403).send(
                'Member not authorized to create survey'
            )
        }

        const result = await modelsFactory.surveyModel.create({
            name: req.body.name, 
            creator_id: req.body.creator_id, 
            organization_id: req.body.organization_id
        })

        return res.status(200).send(result)   
    })

    app.get('/surveys', [
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('limit').optional().isInt({lt: 101, gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

        const limit = isNullOrUndefined(req.query.limit) ? 10 : req.query.limit

        const result = await modelsFactory.surveyModel.findAndCountAll({
            offset: page * limit,
            limit: limit
        })

        return res.status(200).json(result) //is total correct?
    })

    app.get('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const result = await modelsFactory.surveyModel
            .findById(req.params.survey_id)

        if (result) {
            return res.status(200).json(result) 
        }
        return res.status(404)
    })

    app.patch('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        Validator.body('user_id').isInt({gt: 0}), //HACK. MOVE TO AUTH. FIXME
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const member = await modelsFactory.memberModel.findOne({
            where: {
                user_id: req.body.user_id,
                organization_id: req.body.organization_id
            }
        })

        if (!member) {
            return res.status(404).send('Member does not exist')
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
                return res.status(403).send(
                    'Member not authorized to edit survey'
                )
            }
        }
        
        const result = await modelsFactory.surveyModel
            .findById(req.params.survey_id)

        if (!result) {
            return res.status(404)
        }

        if (result.name === req.body.name) {
            return res.status(200).json(result) 
        }

        await result.update({name: req.body.name})

        return res.status(200).json(result) 
    })

    app.delete('/surveys/:survey_id', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.body('user_id').isInt({gt: 0}), //HACK. MOVE TO AUTH. FIXME
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const member = await modelsFactory.memberModel.findOne({
            where: {
                user_id: req.body.creator_id,
                organization_id: req.body.organization_id
            }
        })

        if (!member) {
            return res.status(404).send('Member does not exist')
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
                return res.status(403).send(
                    'Member not authorized to delete survey'
                )
            }
        }

        const result = await modelsFactory.surveyModel
            .destroy({
                where: {
                    id: req.params.survey_id
                }
            })

        if (result === 1) {
            return res.status(200)
        }

        return res.status(404)
    })
}