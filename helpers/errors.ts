export class NotFoundError extends Error {
    static errorName = 'NotFoundError'
    static statusCode = 404
    constructor (name: string, id?: number) {
        super( `Cannot find ${name}${id ? `:${id}` : ``}`)
        this.name = NotFoundError.errorName
    }
}