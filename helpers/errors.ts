
export abstract class BaseError extends Error {
    abstract errorName: string
    abstract statusCode: number

    constructor(message: string) {
        super(message)
        Object.setPrototypeOf(this, BaseError.prototype);
    }
}

export class NotFoundError extends BaseError {
    errorName = 'NotFoundError'
    statusCode = 404
    constructor (name: string, id?: number) {
        super(`Cannot find ${name}${id ? `:${id}` : ``}`)
        this.name = this.errorName
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ForbiddenError extends BaseError {
    errorName = 'ForbiddenError'
    statusCode = 403
    constructor (message: string) {
        super(message)
        this.name = this.errorName
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}