import Sequelize from 'sequelize'
import * as User from './user'
import * as Organization from './organization';
import * as MemberSurveyPermissions from './member_survey_permission'
import {BaseAttributes, dbOptions, getInstanceId} from './helpers';

export const tableName = 'surveys'

export interface Attributes extends BaseAttributes {
    id?: number,
    name: string,
    creator_id: number,
    creator?: User.Attributes,
    organization_id: number,
    organization?: Organization.Attributes
}

export type Instance = Sequelize.Instance<Attributes> & Attributes 

export const sequelizeAttributes: Sequelize.DefineModelAttributes<Attributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false},
    creator_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: User.tableName, key: 'id'  //fix tablename
        }
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: Organization.tableName, key: 'id' 
        }
    }
}

export default (
    sequelize: Sequelize.Sequelize,
    memberSurveyPermissionsModel: Sequelize.Model<MemberSurveyPermissions.Instance, MemberSurveyPermissions.Attributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //todo make a worker
            afterDelete: (survey: Instance) => {
                const survey_id = getInstanceId(survey)

                memberSurveyPermissionsModel.destroy({
                    where: {
                        survey_id: survey_id
                    }
                })
            }
        }
    })

    const model =  sequelize.define<Instance, Attributes>(
        tableName, sequelizeAttributes, options
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

  //  model.Instance().getId = (id: number|undefined) => 1

    
    return model
}
