import Sequelize from 'sequelize'
import * as  Organization from './organization';
import * as User from './user'
import {Role} from '../roles'
import {BaseAttributes, dbOptions} from './helpers';

export const memberTableName = 'members'

export interface MemberAttributes extends BaseAttributes {
    id?: number,
    user_id: number,
    user?: User.UserAttributes,
    organization_id: number,
    organization?: Organization.OrganizationAttributes,
    role_id: number
}

export type MemberInstance = Sequelize.Instance<MemberAttributes> & MemberAttributes 


const sequelizeAttributes: Sequelize.DefineModelAttributes<MemberAttributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: User.userTableName, key: 'id' },
        unique: 'unq_user_org'
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: Organization.organizationTableName, key: 'id' },
        unique: 'unq_user_org'
    },
    role_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        validate: {min: 1, max: Role.allRoles.size}
    }
}

export default (sequelize: Sequelize.Sequelize) => {
    const model = sequelize.define<MemberInstance, MemberAttributes>(
        memberTableName, sequelizeAttributes, dbOptions
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