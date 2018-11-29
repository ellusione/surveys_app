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

export const memberSurveyPermissionStatement = `CREATE TABLE member_survey_permissions (
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL,
    survey_id integer NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT survey_id_fkey FOREIGN KEY (survey_id) REFERENCES surveys(id),
    UNIQUE INDEX user_survey
    ON users(user_id, survey_id)
    WHERE deleted_at IS NOT NULL
)`