import Sequelize from 'sequelize'
import {SQL} from '../helpers'
import * as  SurveyDefinition from '../survey/definition';
import * as UserDefinition from '../user/definition'
import {Role} from '../../roles'
import * as Definition from './definition'
import {dbOptions} from '../helpers';

const sqlStatements: SQL = {
    create: `CREATE TABLE member_survey_permissions (
        id SERIAL PRIMARY KEY,
        user_id integer NOT NULL,
        survey_id integer NOT NULL,
        role_id integer NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone
    )`,
    constraints: [
        `ALTER TABLE member_survey_permissions ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)`,
        `ALTER TABLE member_survey_permissions ADD CONSTRAINT survey_id_fkey FOREIGN KEY (survey_id) REFERENCES surveys(id)`,
        `CREATE UNIQUE INDEX uniq_user_survey ON member_survey_permissions (user_id, survey_id) WHERE deleted_at IS NULL`
    ]
}

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

    return {model, sqlStatements}
}