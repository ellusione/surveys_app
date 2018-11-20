import Sequelize from 'sequelize'
import * as  Organization from './organization';
import * as User from './user'

export const tableName = 'members'

export interface Attributes {
    id?: number,
    user_id: number,
    user?: User.Attributes,
    organization_id: number,
    organization?: Organization.Attributes,
    role_id: number
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

const Attributes = {
    id: {type: Sequelize.NUMBER, primaryKey: true},
    user_id: {
        type: Sequelize.NUMBER, 
        allowNull: false, 
        references: {model: User.tableName, key: 'id' }
    },
    organization_id: {
        type: Sequelize.NUMBER, 
        allowNull: false, 
        references: {model: Organization.tableName, key: 'id' }
    },
    role_id: {
        type: Sequelize.NUMBER, 
        allowNull: false,
        validate: {min: 0, max: 5}
    }
}

export default (sequelize: Sequelize.Sequelize) => {
    const model = sequelize.define<Instance, Attributes>(
        tableName, Attributes
    )

    model.associate = models => {
        model.belongsTo(models.Users, {
            as: 'user', foreignKey: 'user_id'
        })
        model.belongsTo(models.Organizations, {
            as: 'organization', foreignKey: 'organization_id'
        })
    }

    return model
}