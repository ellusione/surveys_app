import Sequelize from 'sequelize'
import * as DeletionJob from './deletion_job'
import * as User from './user'
import * as Organization from './organization';
import * as MemberSurveyPermission from './member_survey_permission'
import {BaseAttributes, dbOptions, getInstanceId} from './helpers';

export const surveyTableName = 'surveys'

export interface SurveyAttributes extends BaseAttributes {
    id?: number,
    name: string,
    creator_id: number,
    creator?: User.UserAttributes,
    organization_id: number,
    organization?: Organization.OrganizationAttributes
}

export type SurveyInstance = Sequelize.Instance<SurveyAttributes> & SurveyAttributes 

export const sequelizeAttributes: Sequelize.DefineModelAttributes<SurveyAttributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false},
    creator_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: User.userTableName, key: 'id'  //fix tablename
        }
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: Organization.organizationTableName, key: 'id' 
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
            afterDelete: (survey: SurveyInstance) => {
                deletionJobModel.create({
                    table_name: MemberSurveyPermission.memberSurveyPermissionTableName,
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

    const model =  sequelize.define<SurveyInstance, SurveyAttributes>(
        surveyTableName, sequelizeAttributes, options
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
