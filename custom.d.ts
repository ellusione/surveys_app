import * as ModelTypes from './models'
import { Model } from 'sequelize';

declare global {

    type NoneAuth = {
        type: 'none'
    }

    type UserAuth = {
        type: 'user'
        id: number,
        instance?: ModelTypes.UserInstance
    }

    type MemberAuth = {
        type: 'member',
        id: number,
        organization_id: number,
        instance?: ModelTypes.MemberInstance
    }
    type Auth = NoneAuth | UserAuth | MemberAuth

   type Resource = {
       type: 'none'
   } | {
        type: 'organization'
        instance: ModelTypes.OrganizationInstance
    } | {
       type: 'member'
       instance: ModelTypes.MemberInstance
    } | {
        type: 'survey'
        instance: ModelTypes.SurveyInstance
    } | {
        type: 'user'
        instance: ModelTypes.UserInstance
    } 

    namespace Express {
        export interface Request {
            auth: Auth,
            resource: Resource
        }
    }
}
