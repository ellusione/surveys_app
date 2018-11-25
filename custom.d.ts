type NoneAuth = {
    type: 'none'
}

type UserAuth = {
    type: 'user'
    id: number
}

type MemberAuth = {
    type: 'member',
    id: number,
    organization_id: number
}
type Auth = NoneAuth | UserAuth | MemberAuth

//declare global {
declare namespace Express {
    export interface Request {
        auth: Auth
    }
 }
//}