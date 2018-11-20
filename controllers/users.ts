import Express from 'express';
import Validator from 'express-validator/check'
import ModelsFactory from '../models'
import {validationErrorHandlingFn} from '../helpers/middleware'
import { isNullOrUndefined } from 'util';
import * as User from '../models/user'

export default function initUsersController(app: Express.Express, modelsFactory: ModelsFactory) {

    app.get('/users', [
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('limit').optional().isInt({lt: 101, gt: 0}),
        validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response) => {
        const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

        const limit = isNullOrUndefined(req.query.limit) ? 10 : req.query.limit

        modelsFactory.userModel.findAndCountAll({
            offset: page * limit,
            limit: limit
        }).then((result) => {
            return res.status(200).json(result) //is total correct?
        })
    })

    app.get('/users/:user_id', [
        Validator.param('user_id').isInt({gt: 0}),
        validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response) => {
        modelsFactory.userModel
            .findById(req.params.user_id)
            .then((result) => {
                if (result) {
                    return res.status(200).json(result) 
                }
                return res.status(404)
            })
    })

    app.post('users', [
        Validator.body('name').isString(),
        validationErrorHandlingFn
    ],
    async function (req: Express.Request, res: Express.Response) {
        const user = await modelsFactory.userModel.create({name: req.body.name})

        return res.status(200).send(user)
    })
}