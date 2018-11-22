import Sequelize from 'sequelize'
import * as  SurveyDefinition from '../survey/definition';
import * as UserDefinition from '../user/definition'
import {Role} from '../../roles'
import * as Definition from './definition'
import {dbOptions} from '../helpers';

const sequelizeAttributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: UserDefinition.userTableName, key: 'id' },
        unique: 'unq_user_survey_role'
    },
    survey_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: SurveyDefinition.surveyTableName, key: 'id' },
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
    const model = sequelize.define<Definition.MemberSurveyPermissionInstance, Definition.MemberSurveyPermissionAttributes>(
        Definition.memberSurveyPermissionTableName , sequelizeAttributes, dbOptions
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