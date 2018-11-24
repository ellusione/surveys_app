
export abstract class BaseError extends Error {
    abstract name: string
    abstract statusCode: number

    constructor(message: string) {
        super(message)
        Object.setPrototypeOf(this, BaseError.prototype);
    }
}

export class BadRequestError extends BaseError {
    name = 'BadRequestError'
    statusCode = 400 
    constructor (message: string) {
        super(message)
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class NotFoundError extends BaseError {
    name = 'NotFoundError'
    statusCode = 404 
    constructor (objectName: string, id?: number) { //make optimizer bind fn?
        super(`Cannot find ${objectName}${id ? `:${id}` : ``}`)
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ForbiddenError extends BaseError {
    name = 'ForbiddenError'
    statusCode = 403
    constructor (message: string) {
        super(message)
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}