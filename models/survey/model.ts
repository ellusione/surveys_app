import Sequelize from 'sequelize'
import * as DeletionJob from '../deletion_job/definition'
import * as UserDefinition from '../user/definition'
import * as OrganizationDefinition from '../organization/definition';
import * as MemberSurveyPermissionDefinition from '../member_survey_permission/definition'
import {dbOptions, getInstanceId} from '../helpers';
import * as Definition from './definition'

export const sequelizeAttributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false},
    creator_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: UserDefinition.userTableName, key: 'id'  //fix tablename
        }
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: OrganizationDefinition.organizationTableName, key: 'id' 
        }
    }
}

export default (
    sequelize: Sequelize.Sequelize,
    deletionJobModel: Sequelize.Model<DeletionJob.DeletionJobInstance, DeletionJob.DeletionJobAttributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //todo make a worker
            afterDestroy: (survey: Definition.SurveyInstance) => {
                deletionJobModel.create({
                    table_name: MemberSurveyPermissionDefinition.memberSurveyPermissionTableName,
                    payload: JSON.stringify({
                        survey_id: getInstanceId(survey)
                    })
                })

                // const survey_id = getInstanceId(survey)

                // memberSurveyPermissionsModel.destroy({
                //     where: {
                //         survey_id: survey_id
                //     }
                // })
            }
        }
    })

    const model =  sequelize.define<Definition.SurveyInstance, Definition.SurveyAttributes>(
        Definition.surveyTableName, sequelizeAttributes, options
    )

    model.associate = models => {
        model.belongsTo(models.Users, {
            as: 'creator', foreignKey: 'creator_id'
        })
        model.belongsTo(models.Organizations, {
            as: 'organization', foreignKey: 'organization_id'
        })
        model.hasMany(models.member_survey_permissions)
    }

    return model
}
