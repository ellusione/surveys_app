
import Express from 'express';
import Sequelize from 'sequelize'
import Validator from 'express-validator/check'
import jwt from 'jsonwebtoken'
import Bluebird from 'bluebird'
import * as Errors from './errors'
import * as config from '../config'

export function calculatePaginationOffset (page: number, limit: number) {
    return limit*(page-1)
}

export function parseAuthHeader (
    req: Express.Request, res: Express.Response, next: Function
) {
    return (async (): Bluebird<void> => {
        const token = req.headers['x-access-token'];

        if (!token) {
            req.auth = {type: 'none'}
            return
        }

        if (typeof token !== 'string') {
            throw new Errors.UnauthorizedError('invalid token format')
        }

        let auth: any
        try {
            auth = jwt.verify(token, config.AUTH_TOKENS.secret)
        } catch (err) {
            const error = <Error>err
            throw new Errors.UnauthorizedError(error.message)
        }

        if (typeof auth !== 'object') {
            throw new Errors.UnauthorizedError('invalid token format')
        }

        const id = auth['id']
        const organization_id = auth['organization_id']

        if (!id || typeof id !== 'number') {
            throw new Errors.UnauthorizedError('invalid token format')
        }

        if (!organization_id) {
            req.auth = {type: 'user', id}
            return
        }

        if (typeof organization_id !== 'number') {
            throw new Errors.UnauthorizedError('invalid token format')
        }

        req.auth = {type: 'member', id, organization_id}
        return
    })().asCallback(next)
}

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

    if (error instanceof Errors.BaseError) {
        return res.status(error.statusCode).json(errorJson)
    }
    if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(400).json(errorJson)
    }
    return res.status(500).json(errorJson)
}