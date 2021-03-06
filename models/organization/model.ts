import Sequelize from 'sequelize'
import lodash from 'lodash'
import {SQL} from '../helpers'
import * as DeletionJobDefinition from '../deletion_job/definition'
import * as MemberDefinition from '../member/definition'
import * as SurveyDefinition from '../survey/definition'
import {dbOptions, getInstanceId} from '../helpers';
import * as Definition from './definition'

const sqlStatements: SQL = {
    create: `CREATE TABLE organizations (
        id SERIAL PRIMARY KEY,
        name character varying(255) NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone
    )`,
    constraints: []
}

const sequelizeAttributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false}
}

export default (
    sequelize: Sequelize.Sequelize,
    deletionJobModel: Sequelize.Model<DeletionJobDefinition.DeletionJobInstance, DeletionJobDefinition.DeletionJobAttributes>
) => {
    const options = lodash.merge({}, dbOptions, {
        hooks: {
            afterDestroy: (organization: Definition.OrganizationInstance) => {
                const payload = JSON.stringify({
                    organization_id: getInstanceId(organization)
                })

                deletionJobModel.bulkCreate([
                    {
                        table_name: MemberDefinition.memberTableName,
                        payload
                    },
                    {
                        table_name: SurveyDefinition.surveyTableName,
                        payload
                    }
                ])
            }
        }
    })

    const model =  sequelize.define<Definition.OrganizationInstance, Definition.OrganizationAttributes>(
        Definition.organizationTableName, sequelizeAttributes, options 
    )

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return {model, sqlStatements}
}