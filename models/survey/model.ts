import Sequelize from 'sequelize'
import lodash from 'lodash'
import {SQL} from '../helpers'
import * as DeletionJobDefinition from '../deletion_job/definition'
import * as UserDefinition from '../user/definition'
import * as OrganizationDefinition from '../organization/definition';
import * as MemberSurveyPermissionDefinition from '../member_survey_permission/definition'
import {dbOptions, getInstanceId} from '../helpers';
import * as Definition from './definition'

const sqlStatements: SQL = {
    drop: `DROP TABLE IF EXISTS surveys`,
    create: `CREATE TABLE surveys (
        id SERIAL PRIMARY KEY,
        name character varying(255) NOT NULL,
        creator_id integer NOT NULL,
        organization_id integer NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone
    );`,
    constraints: [
        `ALTER TABLE surveys CREATE CONSTRAINT creator_id_fkey FOREIGN KEY surveys(creator_id) REFERENCES users(id)`,
        `ALTER TABLE surveys CREATE CONSTRAINT organization_id_fkey FOREIGN KEY surveys(organization_id) REFERENCES organizations(id)`
    ],
    dropForeignConstraints: [
        `ALTER TABLE IF EXISTS surveys DROP CONSTRAINT IF EXISTS creator_id_fkey`,
        `ALTER TABLE IF EXISTS surveys DROP CONSTRAINT IF EXISTS organization_id_fkey`
    ]
}

export const sequelizeAttributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false},
    creator_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: UserDefinition.userTableName, key: 'id'  //fix tablename
        }
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: OrganizationDefinition.organizationTableName, key: 'id' 
        }
    }
}

export default (
    sequelize: Sequelize.Sequelize,
    deletionJobModel: Sequelize.Model<DeletionJobDefinition.DeletionJobInstance, DeletionJobDefinition.DeletionJobAttributes>
) => {
    const options = lodash.merge({}, dbOptions, {
        hooks: {
            afterDestroy: (survey: Definition.SurveyInstance) => {
                deletionJobModel.create({
                    table_name: MemberSurveyPermissionDefinition.memberSurveyPermissionTableName,
                    payload: JSON.stringify({
                        survey_id: getInstanceId(survey)
                    })
                })
            }
        }
    })

    const model =  sequelize.define<Definition.SurveyInstance, Definition.SurveyAttributes>(
        Definition.surveyTableName, sequelizeAttributes, options
    )

    model.associate = models => {
        model.belongsTo(models.Users, {
            as: 'creator', foreignKey: 'creator_id'
        })
        model.belongsTo(models.Organizations, {
            as: 'organization', foreignKey: 'organization_id'
        })
        model.hasMany(models.member_survey_permissions)
    }

    return {model, sqlStatements}
}
