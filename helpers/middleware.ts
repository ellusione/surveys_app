
import Express from 'express';
import Validator from 'express-validator/check'
import * as Errors from './errors'

export function validationErrorHandlingFn (
    req: Express.Request, res: Express.Response, next: Function
) {
    const errors = Validator.validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    return next()
}

export function errorHandlingFn(
    error: Error, req: Express.Request, res: Express.Response, next: Function
) {
    const errorJson = {errors: [error]}

    switch (error.name) {
        case Errors.NotFoundError.errorName:
            return res.status(Errors.NotFoundError.statusCode).json(errorJson)
        default: 
            return res.status(500).json(errorJson)
    }
}
