
import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as jwt from 'jsonwebtoken'
import * as Errors from './errors'
import * as config from '../config'

export function calculatePaginationOffset (page: number, limit: number) {
    return limit*(page-1)
}

export function parseAuthHeader(
    req: Express.Request, res: Express.Response, next: Function
) {
    return (async (): Bluebird<Express.Response> => {
        const token = req.headers['x-access-token'];

        if (!token) {
            return next()
        }

        if (typeof token !== 'string') {
            throw new Errors.UnauthorizedError('invalid token format')
        }

        let auth 
        try {
            auth = <Auth> jwt.verify(token, config.AUTH_TOKENS.secret)
        } catch (err) {
            const error = <Error>err
            throw new Errors.UnauthorizedError(error.message)
        }

        req.auth = auth
        return next()
    })().asCallback(next)
}

export function checkRequiredAuth(req: Express.Request, res: Express.Response, next: Function) {     
    if (!req.auth) {
        throw new Errors.UnauthorizedError('token not provided')
    }
    return next()
}

export function parseOrganizationToken(req: Express.Request, res: Express.Response, next: Function) {     
    if (!req.auth) {
        throw new Errors.UnauthorizedError('token not provided')
    }
    if (!req.auth.organization_id) {
        throw new Errors.UnauthorizedError('improper token provided') 
    }

    return 
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
    return res.status(500).json(errorJson)
}