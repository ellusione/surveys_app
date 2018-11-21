import Sequelize from 'sequelize'
import * as Member from './member'
import * as Survey from './survey'
import {BaseAttributes, dbOptions, getInstanceId} from './helpers';

export const tableName = 'organizations'

export interface Attributes extends BaseAttributes {
    id?: number,
    name: string
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

const sequelizeAttributes: Sequelize.DefineModelAttributes<Attributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false}
}

export default (
    sequelize: Sequelize.Sequelize, 
    memberModel: Sequelize.Model<Member.Instance, Member.Attributes>,
    surveyModel: Sequelize.Model<Survey.Instance, Survey.Attributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //todo make a worker
            afterDelete: (organization: Instance) => {
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

    const model =  sequelize.define<Instance, Attributes>(
        tableName, sequelizeAttributes, options 
    )

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return model
}