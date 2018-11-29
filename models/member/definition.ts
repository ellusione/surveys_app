import Sequelize from 'sequelize'
import * as  OrganizationDefinition from '../organization/definition';
import * as UserDefinition from '../user/definition'
import {BaseAttributes} from '../helpers';

export const memberName = 'member'

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

export const memberSqlStatement = `CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL,
    organization_id integer NOT NULL,
    role_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),,
    CONSTRAINT organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organization(id),
    UNIQUE INDEX user_organization
    ON users(user_id, organization_id)
    WHERE deleted_at IS NOT NULL
)`