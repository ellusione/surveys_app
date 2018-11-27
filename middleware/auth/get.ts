import Express from 'express'
import * as Errors from '../../errors'

export class Auth {
    static getUser (req: Express.Request) {
        if (req.auth.type !== 'user') {
            throw new Errors.UnexpectedError('unexpected auth type')
        }
        if (!req.auth.instance) {
            throw new Errors.UnexpectedError('unexpected null user')
        }
        return req.auth.instance
    }

    static getMember (req: Express.Request) {
        if (req.auth.type !== 'member') {
            throw new Errors.UnexpectedError('unexpected auth type')
        }
        if (!req.auth.instance) {
            throw new Errors.UnexpectedError('unexpected null member')
        }
        return req.auth.instance
    }
}