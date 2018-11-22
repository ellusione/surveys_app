import Sequelize from 'sequelize'
import * as MemberDefinition from '../member/definition'
import * as SurveyDefinition from '../survey/definition'
import {dbOptions, getInstanceId} from '../helpers';
import * as Definition from './definition'

const sequelizeAttributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false}
}

export default (
    sequelize: Sequelize.Sequelize, 
    memberModel: Sequelize.Model<MemberDefinition.MemberInstance, MemberDefinition.MemberAttributes>,
    surveyModel: Sequelize.Model<SurveyDefinition.SurveyInstance, SurveyDefinition.SurveyAttributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //todo make a worker
            afterDestroy: (organization: Definition.OrganizationInstance) => {
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

    const model =  sequelize.define<Definition.OrganizationInstance, Definition.OrganizationAttributes>(
        Definition.organizationTableName, sequelizeAttributes, options 
    )

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return model
}