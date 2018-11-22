import Sequelize from 'sequelize'
import * as UserDefinition from '../user/definition'
import * as OrganizationDefinition from '../organization/definition';
import {BaseAttributes} from '../helpers';

export const surveyTableName = 'surveys'

export interface SurveyAttributes extends BaseAttributes {
    id?: number,
    name: string,
    creator_id: number,
    creator?: UserDefinition.UserAttributes,
    organization_id: number,
    organization?: OrganizationDefinition.OrganizationAttributes
}

export type SurveyInstance = Sequelize.Instance<SurveyAttributes> & SurveyAttributes 
