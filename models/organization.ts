import Sequelize from 'sequelize'
import * as Member from './member'
import * as Survey from './survey'
import {BaseAttributes, dbOptions, getInstanceId} from './helpers';

export module Types {
export const tableName = 'organizations'

    export interface Attributes extends BaseAttributes {
        id?: number,
        name: string
    }

    export type Instance = Sequelize.Instance<Attributes> & Attributes
}

const sequelizeAttributes: Sequelize.DefineModelAttributes<Types.Attributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false}
}

export default (
    sequelize: Sequelize.Sequelize, 
    memberModel: Sequelize.Model<Member.Types.Instance, Member.Types.Attributes>,
    surveyModel: Sequelize.Model<Survey.Types.Instance, Survey.Types.Attributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //todo make a worker
            afterDelete: (organization: Types.Instance) => {
                const org_id = getInstanceId(organization)

                memberModel.destroy({
                    where: {
                        organization_id: org_id
                    }
                })

                surveyModel.destroy({
                    where: {
                        organization_id: org_id
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