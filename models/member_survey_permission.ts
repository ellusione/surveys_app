import Sequelize from 'sequelize'
import * as  Survey from './survey';
import * as User from './user'
import {Role} from '../roles'
import {BaseAttributes, dbOptions} from './helpers';

export const memberSurveyPermissionTableName = 'member_survey_permissions'

export interface MemberSurveyPermissionAttributes extends BaseAttributes {
    id?: number,
    user_id: number,
    user?: User.UserAttributes,
    survey_id: number,
    survey?: Survey.SurveyAttributes,
    role_id: number
}

export type MemberSurveyPermissionInstance = Sequelize.Instance<MemberSurveyPermissionAttributes> & MemberSurveyPermissionAttributes

const sequelizeAttributes: Sequelize.DefineModelAttributes<MemberSurveyPermissionAttributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: User.userTableName, key: 'id' },
        unique: 'unq_user_survey_role'
    },
    survey_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: Survey.surveyTableName, key: 'id' },
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
    const model = sequelize.define<MemberSurveyPermissionInstance, MemberSurveyPermissionAttributes>(
        memberSurveyPermissionTableName, sequelizeAttributes, dbOptions
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