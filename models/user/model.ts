import Sequelize from 'sequelize'
import * as MemberDefinition from '../member/definition'
import * as MemberSurveyPermissionDefinition from '../member_survey_permission/definition'
import { BaseAttributes, dbOptions, getInstanceId } from '../helpers';
import * as Definition from './definition'

const sequelizeAttributes = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false }
}

export default (
    sequelize: Sequelize.Sequelize,
    memberModel: Sequelize.Model<MemberDefinition.MemberInstance, MemberDefinition.MemberAttributes>,
    memberSurveyPermissionsModel: Sequelize.Model<MemberSurveyPermissionDefinition.MemberSurveyPermissionInstance, MemberSurveyPermissionDefinition.MemberSurveyPermissionAttributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //change creator of survey also?
            //todo make a worker
            afterDestroy: (user: Definition.UserInstance) => {
                const user_id = getInstanceId(user)

                memberModel.destroy({
                    where: {
                        user_id: user_id
                    }
                })
                memberSurveyPermissionsModel.destroy({
                    where: {
                        user_id: user_id
                    }
                })
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