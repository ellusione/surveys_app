import Express from 'express';
import * as Errors from '../../errors'

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