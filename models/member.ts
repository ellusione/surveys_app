import Sequelize from 'sequelize'
import * as  Organization from './organization';
import * as User from './user'
import {Role} from '../roles'
import {BaseAttributes, dbOptions} from './helpers';

export module Types {
    export const tableName = 'members'
    export interface Attributes extends BaseAttributes {
        id?: number,
        user_id: number,
        user?: User.Types.Attributes,
        organization_id: number,
        organization?: Organization.Types.Attributes,
        role_id: number
    }

    export type Instance = Sequelize.Instance<Attributes> & Attributes 
}

const sequelizeAttributes: Sequelize.DefineModelAttributes<Types.Attributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: User.Types.tableName, key: 'id' },
        unique: 'unq_user_org'
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: Organization.Types.tableName, key: 'id' },
        unique: 'unq_user_org'
    },
    role_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        validate: {min: 1, max: Role.allRoles.size}
    }
}

export default (sequelize: Sequelize.Sequelize) => {
    const model = sequelize.define<Types.Instance, Types.Attributes>(
        Types.tableName, sequelizeAttributes, dbOptions
    )

    model.associate = models => {
        model.belongsTo(models.Users, {
            as: 'user', foreignKey: 'user_id'
        })
        model.belongsTo(models.Organizations, {
            as: 'organization', foreignKey: 'organization_id'
        })
    }

    return model
}