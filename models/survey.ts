import Sequelize from 'sequelize'
import * as User from './user'
import * as Organization from './organization';
import * as MemberSurveyPermission from './member_survey_permission'
import {BaseAttributes, dbOptions, getInstanceId} from './helpers';

export module Types {
    export const tableName = 'surveys'

    export interface Attributes extends BaseAttributes {
        id?: number,
        name: string,
        creator_id: number,
        creator?: User.Types.Attributes,
        organization_id: number,
        organization?: Organization.Types.Attributes
    }

    export type Instance = Sequelize.Instance<Attributes> & Attributes 
}
export const sequelizeAttributes: Sequelize.DefineModelAttributes<Types.Attributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, allowNull: false},
    creator_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: User.Types.tableName, key: 'id'  //fix tablename
        }
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: Organization.Types.tableName, key: 'id' 
        }
    }
}

export default (
    sequelize: Sequelize.Sequelize,
    memberSurveyPermissionsModel: Sequelize.Model<MemberSurveyPermission.Types.Instance, MemberSurveyPermission.Types.Attributes>
) => {
    const options = Object.assign({}, dbOptions, {
        hooks: {
            //todo make a worker
            afterDelete: (survey: Types.Instance) => {
                const survey_id = getInstanceId(survey)

                memberSurveyPermissionsModel.destroy({
                    where: {
                        survey_id: survey_id
                    }
                })
            }
        }
    })

    const model =  sequelize.define<Types.Instance, Types.Attributes>(
        Types.tableName, sequelizeAttributes, options
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
