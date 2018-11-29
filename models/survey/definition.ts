import Sequelize from 'sequelize'
import * as UserDefinition from '../user/definition'
import * as OrganizationDefinition from '../organization/definition';
import {BaseAttributes} from '../helpers';

export const surveyName = 'survey'

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

export const surveySqlStatement = `CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    creator_id integer NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT creator_id_fkey FOREIGN KEY (creator_id) REFERENCES users(id),
    CONSTRAINT organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organization(id)
);`