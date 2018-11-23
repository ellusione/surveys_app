import Express from 'express';
import Validator from 'express-validator/check'
import * as Models from '../models'
import {validationErrorHandlingFn} from '../helpers/middleware'
import {Role} from '../roles'

export function initMemberSurveyPermissionController(app: Express.Express, modelsFactory: Models.Factory) {

    app.post('/surveys/:survey_id/users/:user_id/permissions', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.param('user_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {

        const survey = await modelsFactory.surveyModel.findById(req.body.survey_id)

        if (!survey) {
            return res.status(404).send('Survey not found')
        }

        const member = await modelsFactory.memberModel.findOne({
            where: {
                user_id: req.body.user_id,
                organization_id: survey.organization_id
            }
        })

        if (!member) {
            return res.status(403).send('User is not a member of the required organization')
        }

        if (member.role_id > req.body.role_id) {
            return res.status(400).send('Detected incorrect user permission')
        }

        const result = await modelsFactory.memberSurveyPermissionModel 
            .create({
                survey_id: req.body.survey_id,
                user_id: req.body.user_id,
                role_id: req.body.role_id
            })

        return res.status(200).json(result) 
    })
    
    app.get('/surveys/:survey_id/users/:user_id/permissions', [
        Validator.param('survey_id').isInt({gt: 0}),
        Validator.param('user_id').isInt({gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const result = await modelsFactory.memberSurveyPermissionModel.findAll({
            where: {
                survey_id: req.body.survey_id,
                user_id: req.body.user_id
            }
        })

        return res.status(200).json(result) 
    })

    app.delete('/surveys/:survey_id/users/:user_id/permissions', [
        Validator.body('role_id').optional().isInt({gt: 0, lt: Role.allRoles.size+1}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {

        if (req.body.role_id) {
            await modelsFactory.memberSurveyPermissionModel 
                .destroy({
                    where: {
                        survey_id: req.body.survey_id,
                        user_id: req.body.user_id,
                        role_id: req.body.role_id
                    }
                })

            return res.status(200)
        }

        await modelsFactory.memberSurveyPermissionModel 
            .destroy({
                where: {
                    survey_id: req.body.survey_id,
                    user_id: req.body.user_id
                }
            })

        return res.status(200)
    })

}