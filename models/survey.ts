import Sequelize from 'sequelize'
import * as User from './user'
import * as Organization from './organization';

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
    id: {type: Sequelize.NUMBER, primaryKey: true},
    name: {type: Sequelize.STRING, allowNull: false},
    creator_id: {
        type: Sequelize.NUMBER, 
        allowNull: false, 
        references: {
            model: User.tableName, key: 'id' 
        }
    },
    organization_id: {
        type: Sequelize.NUMBER, 
        allowNull: false, 
        references: {
            model: Organization.tableName, key: 'id' 
        }
    }
}

export default (sequelize: Sequelize.Sequelize) => {
    const model =  sequelize.define<Instance, Attributes>(
        tableName, Attributes
    )

    model.associate = models => {
        model.belongsTo(models.Users, {
            as: 'creator', foreignKey: 'creator_id'
        })
        model.belongsTo(models.Organizations, {
            as: 'organization', foreignKey: 'organization_id'
        })
    }

    return model
}
