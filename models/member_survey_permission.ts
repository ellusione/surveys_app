import Sequelize from 'sequelize'
import * as  Survey from './survey';
import * as User from './user'
import {Role} from '../roles'

export const tableName = 'member_survey_permissions'

export interface Attributes {
    id?: number,
    user_id: number,
    user?: User.Attributes,
    survey_id: number,
    survey?: Survey.Attributes,
    role_id: number
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

const Attributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true},
    user_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: User.tableName, key: 'id' }
    },
    survey_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: Survey.tableName, key: 'id' }
    },
    role_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        validate: {min: 1, max: Role.allRoles.size}
    },
    uniqueKeys: {
        'unq_user_survey_role': ['user_id', 'survey_id', 'role_id'],
        customIndex: true    
    }
}

export default (sequelize: Sequelize.Sequelize) => {
    const model = sequelize.define<Instance, Attributes>(
        tableName, Attributes
    )

    model.associate = models => {
        model.belongsTo(models.Users, {
            as: 'user', foreignKey: 'user_id'
        })
        model.belongsTo(models.Surveys, {
            as: 'survey', foreignKey: 'survey_id'
        })
    }

    return model
}