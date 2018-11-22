import Sequelize from 'sequelize'
import {BaseAttributes} from '../helpers';

export const organizationTableName = 'organizations'

export interface OrganizationAttributes extends BaseAttributes {
    id?: number,
    name: string
}

export type OrganizationInstance = Sequelize.Instance<OrganizationAttributes> & OrganizationAttributes
