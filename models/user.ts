import Sequelize from 'sequelize'
import { dbOptions } from './database';
import * as Survey from './survey'
import * as Member from './member'
import * as MemberSurveyPermissions from './member_survey_permission'

export const tableName = 'users'

export interface Attributes {
    id?: number,
    name: string
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

export const Attributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true},
    name: {type: Sequelize.STRING, allowNull: false}
}

export default (
    sequelize: Sequelize.Sequelize, 
    memberModel: Sequelize.Model<Member.Instance, Member.Attributes>,
    memberSurveyPermissionsModel: Sequelize.Model<MemberSurveyPermissions.Instance, MemberSurveyPermissions.Attributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //change creator of survey also?
            //todo make a worker
            afterDelete: (user: Instance) => {
                if (!user.id) {
                    throw new Error('User does not have id')
                }
                memberModel.destroy({
                    where: {
                        user_id: user.id
                    }
                })
                memberSurveyPermissionsModel.destroy({
                    where: {
                        user_id: user.id
                    }
                })
            }
        }
    })
    const model =  sequelize.define<Instance, Attributes>(
        tableName, Attributes, options
    )

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return model
}