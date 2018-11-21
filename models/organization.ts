import Sequelize from 'sequelize'
import {dbOptions} from '../database'
import * as Member from './member'
import * as Survey from './survey'

export const tableName = 'organizations'

export interface Attributes {
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
                if (!organization.id) {
                    throw new Error('no id on organization') //fixme
                }

                memberModel.destroy({
                    where: {
                        organization_id: organization.id
                    }
                })

                surveyModel.destroy({
                    where: {
                        organization_id: organization.id
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