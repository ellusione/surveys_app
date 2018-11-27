
import Express from 'express';
import Sequelize from 'sequelize'
import Validator from 'express-validator/check'
import * as Errors from '../errors'

export function setRequiredProperties(
    req: Express.Request, res: Express.Response, next: Function
) {
    req.auth = {type: 'none'}

    req.resource = {type: 'none'}
    return next()
}

export function getAuthUser (req: Express.Request) {
    if (req.auth.type !== 'user') {
        throw new Errors.UnexpectedError('unexpected auth type')
    }
    if (!req.auth.instance) {
        throw new Errors.UnexpectedError('unexpected null user')
    }
    return req.auth.instance
}

export function getAuthMember (req: Express.Request) {
    if (req.auth.type !== 'member') {
        throw new Errors.UnexpectedError('unexpected auth type')
    }
    if (!req.auth.instance) {
        throw new Errors.UnexpectedError('unexpected null member')
    }
    return req.auth.instance
}

export function getUser (req: Express.Request) {
    if (req.resource.type !== 'user') {
        throw new Errors.UnexpectedError('unexpected resource type')
    }

    return req.resource.instance
}

export function getSurvey (req: Express.Request) {
    if (req.resource.type !== 'survey') {
        throw new Errors.UnexpectedError('unexpected resource type')
    }

    return req.resource.instance
}

export function getOrganization (req: Express.Request) {
    if (req.resource.type !== 'organization') {
        throw new Errors.UnexpectedError('unexpected resource type')
    }

    return req.resource.instance
}

export function getMember (req: Express.Request) {
    if (req.resource.type !== 'member') {
        throw new Errors.UnexpectedError('unexpected resource type')
    }

    return req.resource.instance
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