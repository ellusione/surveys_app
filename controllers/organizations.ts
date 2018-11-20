import Express from 'express';
import Validator from 'express-validator/check'
import ModelsFactory from '../models'
import {validationErrorHandlingFn} from '../helpers/middleware'
import { isNullOrUndefined } from 'util';
import * as Organization from '../models/organization'

export default function initOrganizationsController(app: Express.Express, modelsFactory: ModelsFactory) {

    app.post('organizations', [
        Validator.body('name').isString(),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const result = await modelsFactory.organizationModel.create({name: req.body.name})

        return res.status(200).send(result)
    })

    app.get('/organizations', [
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('limit').optional().isInt({lt: 101, gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

        const limit = isNullOrUndefined(req.query.limit) ? 10 : req.query.limit

        const result = await modelsFactory.organizationModel.findAndCountAll({
            offset: page * limit,
            limit: limit
        })

        return res.status(200).json(result) //is total correct?
    })

    app.get('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const result = await modelsFactory.organizationModel.findById(req.params.organization_id)

        if (result) {
            return res.status(200).json(result) 
        }
        return res.status(404)
    })

    app.patch('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const result = await modelsFactory.organizationModel
            .findById(req.params.organization_id)

        if (!result) {
            return res.status(404)
        }

        if (result.name === req.body.name) {
            return res.status(200).json(result) 
        }

        await result.update({name: req.body.name})

        return res.status(200).json(result) 
    })

    app.delete('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        validationErrorHandlingFn
    ],
    async (req: Express.Request, res: Express.Response) => {
        const result = await modelsFactory.organizationModel
            .destroy({
                where: {
                    id: req.params.organization_id
                }
            }) 

        if (result === 1) {
            return res.status(200)
        }

        return res.status(404)
    })
}