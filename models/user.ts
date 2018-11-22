import Sequelize from 'sequelize'
import * as Survey from './survey'
import * as Member from './member'
import * as MemberSurveyPermission from './member_survey_permission'
import { BaseAttributes, dbOptions, getInstanceId } from './helpers';

export const userTableName = 'users'

export interface UserAttributes extends BaseAttributes {
    id?: number,
    name: string
}

export type UserInstance = Sequelize.Instance<UserAttributes> & UserAttributes & BaseAttributes

const sequelizeAttributes: Sequelize.DefineModelAttributes<UserAttributes> = {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false }
}

export default (
    sequelize: Sequelize.Sequelize,
    memberModel: Sequelize.Model<Member.MemberInstance, Member.MemberAttributes>,
    memberSurveyPermissionsModel: Sequelize.Model<MemberSurveyPermission.MemberSurveyPermissionInstance, MemberSurveyPermission.MemberSurveyPermissionAttributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //change creator of survey also?
            //todo make a worker
            afterDelete: (user: UserInstance) => {
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

    const model = sequelize.define<UserInstance, UserAttributes>(
        userTableName, sequelizeAttributes, options
    )

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return model
}