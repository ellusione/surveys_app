import Express from 'express';
import * as Errors from '../../errors'

export default class GetResource {
    static getUser (req: Express.Request) {
        if (req.resource.type !== 'user') {
            throw new Errors.UnexpectedError('unexpected resource type')
        }

        return req.resource.instance
    }

    static getSurvey (req: Express.Request) {
        if (req.resource.type !== 'survey') {
            throw new Errors.UnexpectedError('unexpected resource type')
        }

        return req.resource.instance
    }

    static getOrganization (req: Express.Request) {
        if (req.resource.type !== 'organization') {
            throw new Errors.UnexpectedError('unexpected resource type')
        }

        return req.resource.instance
    }

    static getMember (req: Express.Request) {
        if (req.resource.type !== 'member') {
            throw new Errors.UnexpectedError('unexpected resource type')
        }

        return req.resource.instance
    }
}