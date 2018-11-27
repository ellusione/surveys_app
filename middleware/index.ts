
import Express from 'express';
import Sequelize from 'sequelize'
import Validator from 'express-validator/check'
import * as Errors from '../errors'

export function setRequiredProperties<T extends LocalResources>(
    req: Express.Request, res: Express.Response, next: Function
) {
    req.auth = {type: 'none'}

    res.customLocals = {type: 'none'}
    return next()
}

export function getAuthUser (req: Express.Request) {
    if (req.auth.type !== 'user') {
        throw new Errors.UnexpectedError('unexpected auth type')
    }
    if (!req.auth.user) {
        throw new Errors.UnexpectedError('unexpected null member')
    }
    return req.auth.user
}

export function getAuthMember (req: Express.Request) {
    if (req.auth.type !== 'member') {
        throw new Errors.UnexpectedError('unexpected auth type')
    }
    if (!req.auth.member) {
        throw new Errors.UnexpectedError('unexpected null member')
    }
    return req.auth.member
}

export function getUser (res: Express.Response) {
    if (res.customLocals.type !== 'user') {
        throw new Errors.UnexpectedError('unexpected customLocals type')
    }

    return res.customLocals.resource
}

export function getSurvey (res: Express.Response) {
    if (res.customLocals.type !== 'survey') {
        throw new Errors.UnexpectedError('unexpected customLocals type')
    }

    return res.customLocals.resource
}

export function getOrganization (res: Express.Response) {
    if (res.customLocals.type !== 'organization') {
        throw new Errors.UnexpectedError('unexpected customLocals type')
    }

    return res.customLocals.resource
}

export function getMember (res: Express.Response) {
    if (res.customLocals.type !== 'member') {
        throw new Errors.UnexpectedError('unexpected customLocals type')
    }

    return res.customLocals.resource
}

export function calculatePaginationOffset (page: number, limit: number) {
    return limit*(page-1)
}

export function validationErrorHandlingFn (
    req: Express.Request, res: Express.Response, next: Function
) {
    const errors = Validator.validationResult(req)
    if (!errors.isEmpty()) {

        console.error(`Validation errors on ${req.method} request to ${req.url}`, {errors: errors.array()})
        return res.status(400).json({ errors: errors.array() });
    }

    return next()
}

export function errorHandlingFn(
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