import Sequelize from 'sequelize'
import * as DeletionJobDefinition from '../deletion_job/definition'
import * as MemberDefinition from '../member/definition'
import * as MemberSurveyPermissionDefinition from '../member_survey_permission/definition'
import { dbOptions, getInstanceId } from '../helpers';
import * as Definition from './definition'

const sequelizeAttributes = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false }
}

export default (
    sequelize: Sequelize.Sequelize,
    deletionJobModel: Sequelize.Model<DeletionJobDefinition.DeletionJobInstance, DeletionJobDefinition.DeletionJobAttributes>
) => {
    const options = Object.assign({}, dbOptions, {
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

    return model
}