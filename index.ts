import ModelsFactory from './models'
import Express from 'express';
import Http from 'http';
import Validator from 'express-validator/check'
import { isNullOrUndefined } from 'util';

const port = process.env.PORT || 3000

const modelsFactory = new ModelsFactory()

const app = Express();

const server = new Http.Server(app) 
server.listen(port)

app.use(Express.json())

function validationErrorHandlingFn (
    req: Express.Request, res: Express.Response, next: Function
) {
    const errors = Validator.validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    return next()
}

app.get('/surveys', [
    Validator.query('page').optional().isInt({gt: -1}), 
    Validator.query('limit').optional().isInt({lt: 101, gt: 0}),
    validationErrorHandlingFn
],
(req: Express.Request, res: Express.Response) => {
    const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

    const limit = isNullOrUndefined(req.query.limit) ? 10 : req.query.limit

    modelsFactory.surveyModel.findAndCountAll({
        offset: page * limit,
        limit: limit
    }).then((result) => {
        return res.status(200).json(result) //is total correct?
    })
})

app.get('/surveys/:survey_id', [
    Validator.param('survey_id').isInt({gt: 0}),
    validationErrorHandlingFn
],
(req: Express.Request, res: Express.Response) => {
    modelsFactory.surveyModel
        .findById(req.params.survey_id)
        .then((result) => {
            if (result) {
                return res.status(200).json(result) 
            }
            return res.status(404)
        })
})

app.post('surveys', [
    Validator.body('creator_id').isInt({gt: 0}),
    Validator.body('organization_id').isInt({gt: 0}),
    Validator.body('name').isString(),
    validationErrorHandlingFn
],
async function (req: Express.Request, res: Express.Response) {
    const result = await modelsFactory.userModel.findById(req.body.creator_id)
        // .then((result)) => {
        //     if (result) {
        // }
})