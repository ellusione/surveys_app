import Sequelize from 'sequelize'
import * as  SurveyDefinition from '../survey/definition';
import * as UserDefinition from '../user/definition'
import {BaseAttributes} from '../helpers';

export const memberSurveyPermissionName = 'member_survey_permission'

export const memberSurveyPermissionTableName = 'member_survey_permissions'

export interface MemberSurveyPermissionAttributes extends BaseAttributes {
    id?: number,
    user_id: number,
    user?: UserDefinition.UserAttributes,
    survey_id: number,
    survey?: SurveyDefinition.SurveyAttributes,
    role_id: number
}

export type MemberSurveyPermissionInstance = Sequelize.Instance<MemberSurveyPermissionAttributes> & MemberSurveyPermissionAttributes
