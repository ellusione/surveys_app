import Sequelize from 'sequelize'
import * as Survey from './survey'
import * as Member from './member'
import * as MemberSurveyPermission from './member_survey_permission'
import {BaseAttributes, dbOptions, getInstanceId} from './helpers';

export module Types {
    export const tableName = 'users'

    export interface Attributes extends BaseAttributes {
        id?: number,
        name: string
    }

    export type Instance = Sequelize.Instance<Attributes> & Attributes & BaseAttributes
}

const sequelizeAttributes: Sequelize.DefineModelAttributes<Types.Attributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false}
}

export default (
    sequelize: Sequelize.Sequelize, 
    memberModel: Sequelize.Model<Member.Types.Instance, Member.Types.Attributes>,
    memberSurveyPermissionsModel: Sequelize.Model<MemberSurveyPermission.Types.Instance, MemberSurveyPermission.Types.Attributes>
) =>{
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //change creator of survey also?
            //todo make a worker
            afterDelete: (user: Types.Instance) => {
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

    const model =  sequelize.define<Types.Instance, Types.Attributes>(
        Types.tableName, sequelizeAttributes, options
    ) 

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return model
}