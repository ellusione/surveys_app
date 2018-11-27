
import Express from 'express';
import Sequelize from 'sequelize'
import Validator from 'express-validator/check'
import * as Errors from '../errors'

export class Base {
    static setRequiredProperties(
        req: Express.Request, res: Express.Response, next: Function
    ) {
        req.auth = {type: 'none'}

        req.resource = {type: 'none'}
        return next()
    }

    static calculatePaginationOffset (page: number, limit: number) {
        return limit*(page-1)
    }

    static validationErrorHandlingFn (
        req: Express.Request, res: Express.Response, next: Function
    ) {
        const errors = Validator.validationResult(req)
        if (!errors.isEmpty()) {

            console.error(`Validation errors on ${req.method} request to ${req.url}`, {errors: errors.array()})
            return res.status(400).json({ errors: errors.array() });
        }

        return next()
    }

    static errorHandlingFn(
        error: Error, req: Express.Request, res: Express.Response, next: Function
    ) {
        console.error(`Error on ${req.method} request to ${req.url}`, error)

        const errorJson = {errors: [error]}

        if (error instanceof Errors.BaseError) {
            return res.status(error.statusCode).json(errorJson)
        }
        if (error instanceof Sequelize.UniqueConstraintError) {
            return res.status(400).json(errorJson)
        }

        return res.status(500).json(errorJson)
    }
}