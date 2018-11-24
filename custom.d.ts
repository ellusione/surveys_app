
type Auth = {
    id: number,
    organization_id?: number
}

type UserAuth = {
    id: number
}
type MemberAuth = UserAuth & {
    organization_id: number
}

declare namespace Express {
    export interface Request {
        auth?: Auth
    }
 }