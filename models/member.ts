import Sequelize from 'sequelize'
import * as  Organization from './organization';
import * as User from './user'
import {Role} from '../roles'
import {dbOptions} from './database'

export const tableName = 'members'

export interface Attributes {
    id?: number,
    user_id: number,
    user?: User.Attributes,
    organization_id: number,
    organization?: Organization.Attributes,
    role_id: number
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

const sequelizeAttributes: Sequelize.DefineModelAttributes<Attributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true},
    user_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: User.tableName, key: 'id' },
        unique: 'unq_user_org'
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: Organization.tableName, key: 'id' },
        unique: 'unq_user_org'
    },
    role_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        validate: {min: 1, max: Role.allRoles.size}
    }
}

export default (sequelize: Sequelize.Sequelize) => {
    const model = sequelize.define<Instance, Attributes>(
        tableName, sequelizeAttributes, dbOptions
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