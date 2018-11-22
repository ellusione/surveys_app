import Sequelize from 'sequelize'
import * as  OrganizationDefinition from '../organization/definition';
import * as UserDefinition from '../user/definition'
import {BaseAttributes} from '../helpers';

export const memberTableName = 'members'

export interface MemberAttributes extends BaseAttributes {
    id?: number,
    user_id: number,
    user?: UserDefinition.UserAttributes,
    organization_id: number,
    organization?: OrganizationDefinition.OrganizationAttributes,
    role_id: number
}

export type MemberInstance = Sequelize.Instance<MemberAttributes> & MemberAttributes 
