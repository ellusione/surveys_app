import Sequelize from 'sequelize'
import {BaseAttributes} from '../helpers';

export const organizationName = 'organization'

export const organizationTableName = 'organizations'

export interface OrganizationAttributes extends BaseAttributes {
    id?: number,
    name: string
}

export type OrganizationInstance = Sequelize.Instance<OrganizationAttributes> & OrganizationAttributes

export const organizationSqlStatement = `CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
)`