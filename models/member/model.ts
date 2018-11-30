import Sequelize from 'sequelize'
import {SQL} from '../helpers'
import * as  OrganizationDefinition from '../organization/definition';
import * as UserDefinition from '../user/definition'
import {Role} from '../../roles'
import {dbOptions} from '../helpers';
import * as Definition from './definition'

const sqlStatements: SQL = {
    drop: `DROP TABLE IF EXISTS members`,
    create: `CREATE TABLE members (
        id SERIAL PRIMARY KEY,
        user_id integer NOT NULL,
        organization_id integer NOT NULL,
        role_id integer NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone
    )`,
    additionalConstraints: [
        `CREATE CONSTRAINT user_id_fkey FOREIGN KEY members(user_id) REFERENCES users(id)`,
        `CREATE CONSTRAINT organization_id_fkey FOREIGN KEY members(organization_id) REFERENCES organizations(id)`,
        `CREATE UNIQUE INDEX user_organization ON members(user_id, organization_id) WHERE deleted_at IS NOT NULL`
    ]
}

const sequelizeAttributes = {
    id: {
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: UserDefinition.userTableName, key: 'id' }
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: OrganizationDefinition.organizationTableName, key: 'id' }
    },
    role_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        validate: {min: 1, max: Role.allRoles.size}
    }
}

export default (sequelize: Sequelize.Sequelize) => {
    const model = sequelize.define<Definition.MemberInstance, Definition.MemberAttributes>(
        Definition.memberTableName, sequelizeAttributes, dbOptions
    )

    model.associate = models => {
        model.belongsTo(models.Users, {
            as: 'user', foreignKey: 'user_id'
        })
        model.belongsTo(models.Organizations, {
            as: 'organization', foreignKey: 'organization_id'
        })
    }

    return {model, sqlStatements}
}