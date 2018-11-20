import Sequelize from 'sequelize'
import * as User from './user'
import * as Organization from './organization';
import {dbOptions} from './database'
import * as MemberSurveyPermissions from './member_survey_permission'

export const tableName = 'surveys'

export interface Attributes {
    id?: number,
    name: string,
    creator_id: number,
    creator?: User.Attributes,
    organization_id: number,
    organization?: Organization.Attributes
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

const Attributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true},
    name: {type: Sequelize.STRING, allowNull: false},
    creator_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {
            model: User.tableName, key: 'id' 
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
                if (!survey.id) {
                    throw new Error('Survey does not have id')
                }
                memberSurveyPermissionsModel.destroy({
                    where: {
                        survey_id: survey.id
                    }
                })
            }
        }
    })
    const model =  sequelize.define<Instance, Attributes>(
        tableName, Attributes, options
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
