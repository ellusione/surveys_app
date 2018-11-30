import Sequelize from 'sequelize'
import lodash from 'lodash'
import {SQL} from '../helpers'
import * as DeletionJobDefinition from '../deletion_job/definition'
import * as MemberDefinition from '../member/definition'
import * as MemberSurveyPermissionDefinition from '../member_survey_permission/definition'
import { dbOptions, getInstanceId } from '../helpers';
import * as Definition from './definition'

const sqlStatements: SQL = {
    create: `CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name character varying(255) NOT NULL,
        username character varying(255) NOT NULL,
        password character varying(255) NOT NULL,
        email character varying(255) NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone
    )`,
    constraints: [
        `CREATE UNIQUE INDEX uniq_username ON users (username) WHERE deleted_at IS NULL`,
        `CREATE UNIQUE INDEX uniq_email ON users (email) WHERE deleted_at IS NULL`
    ]
}

const sequelizeAttributes = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    username: { type: Sequelize.STRING, allowNull: false },
    password: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false}
}

export default (
    sequelize: Sequelize.Sequelize,
    deletionJobModel: Sequelize.Model<DeletionJobDefinition.DeletionJobInstance, DeletionJobDefinition.DeletionJobAttributes>
) => {
    const options = lodash.merge({}, dbOptions, {
        defaultScope: {
            attributes: { exclude: ['password', 'username', 'email'] }
        },
        scopes: {
            withCredentials: {
                attributes: { include: ['password', 'username', 'email'] }
            }
        },
        hooks: {
            //change creator of survey also?
            afterDestroy: (user: Definition.UserInstance) => {
                const payload = JSON.stringify({
                    user_id: getInstanceId(user)
                })

                deletionJobModel.bulkCreate([
                    {
                        table_name:  MemberDefinition.memberTableName,
                        payload
                    },
                    {
                        table_name:  MemberSurveyPermissionDefinition.memberSurveyPermissionTableName,
                        payload
                    }
                ])
            }
        }
    })

    const model = sequelize.define<Definition.UserInstance, Definition.UserAttributes>(
        Definition.userTableName, sequelizeAttributes, options
    )

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return {model, sqlStatements}
}