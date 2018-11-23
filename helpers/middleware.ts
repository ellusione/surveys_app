
import Express from 'express';
import Validator from 'express-validator/check'

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

    switch (error.constructor) {
        case Errors.NotFoundError: 
            return res.status(404).json(errorJson)
        default: 
            return res.status(500).json(errorJson)
    }
}

export const Errors = {
    NotFoundError: class NotFoundError extends Error {
        constructor (name: string, id: number) {
            super()
            this.message = `Cannot find ${name}:${id}`
        }
    }
}