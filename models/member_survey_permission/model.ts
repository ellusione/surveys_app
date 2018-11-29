import Sequelize from 'sequelize'
import lodash from 'lodash'
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
        references: {model: UserDefinition.userTableName, key: 'id' }
    },
    survey_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: SurveyDefinition.surveyTableName, key: 'id' }
    },
    role_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        validate: {min: 1, max: Role.allRoles.size}
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
    deleted_at: Sequelize.DATE
}

export default (sequelize: Sequelize.Sequelize) => {

    const options = lodash.merge({}, dbOptions, {
        indexes: [
            {fields: ['user_id', 'survey_id', 'deleted_at'], unique: true}
        ]
    })
    
    const model = sequelize.define<Definition.MemberSurveyPermissionInstance, Definition.MemberSurveyPermissionAttributes>(
        Definition.memberSurveyPermissionTableName , sequelizeAttributes, options
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