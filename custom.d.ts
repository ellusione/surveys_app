import * as ModelTypes from './models'
import { Model } from 'sequelize';

declare global {

    type NoneAuth = {
        type: 'none'
    }

    type UserAuth = {
        type: 'user'
        id: number,
        user?: ModelTypes.UserInstance
    }

    type MemberAuth = {
        type: 'member',
        id: number,
        organization_id: number,
        member?: ModelTypes.MemberInstance
    }
    type Auth = NoneAuth | UserAuth | MemberAuth

   type LocalResources = {
       type: 'none'
   } | {
        type: 'organization'
        resource: ModelTypes.OrganizationInstance
    } | {
       type: 'member'
       resource: ModelTypes.MemberInstance
    } | {
        type: 'survey'
        resource: ModelTypes.SurveyInstance
    } | {
        type: 'user'
        resource: ModelTypes.UserInstance
    } 

    namespace Express {
        export interface Request {
            auth: Auth
        }
        export interface Response {
            customLocals: LocalResources
        }
    }
}
