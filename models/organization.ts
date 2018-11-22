import Sequelize from 'sequelize'
import * as Member from './member'
import * as Survey from './survey'
import {BaseAttributes, dbOptions, getInstanceId} from './helpers';

export const organizationTableName = 'organizations'

export interface OrganizationAttributes extends BaseAttributes {
    id?: number,
    name: string
}

export type OrganizationInstance = Sequelize.Instance<OrganizationAttributes> & OrganizationAttributes

const sequelizeAttributes: Sequelize.DefineModelAttributes<OrganizationAttributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false}
}

export default (
    sequelize: Sequelize.Sequelize, 
    memberModel: Sequelize.Model<Member.MemberInstance, Member.MemberAttributes>,
    surveyModel: Sequelize.Model<Survey.SurveyInstance, Survey.SurveyAttributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //todo make a worker
            afterDelete: (organization: OrganizationInstance) => {
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

    const model =  sequelize.define<OrganizationInstance, OrganizationAttributes>(
        organizationTableName, sequelizeAttributes, options 
    )

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return model
}