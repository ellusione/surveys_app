import Sequelize from 'sequelize'
import * as  Survey from './survey';
import * as User from './user'
import {Role} from '../roles'
import {BaseAttributes, dbOptions} from './helpers';

export module Types {
    export const tableName = 'member_survey_permissions'

    export interface Attributes extends BaseAttributes {
        id?: number,
        user_id: number,
        user?: User.Types.Attributes,
        survey_id: number,
        survey?: Survey.Types.Attributes,
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
        unique: 'unq_user_survey_role'
    },
    survey_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: Survey.Types.tableName, key: 'id' },
        unique: 'unq_user_survey_role'
    },
    role_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        validate: {min: 1, max: Role.allRoles.size},
        unique: 'unq_user_survey_role'
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
        model.belongsTo(models.Surveys, {
            as: 'survey', foreignKey: 'survey_id'
        })
    }

    return model
}