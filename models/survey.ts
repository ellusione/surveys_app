import Sequelize from 'sequelize'
import * as User from './user'

export const tableName = 'surveys'

export interface Attributes {
    id?: number,
    name: string,
    owner_id: number,
    owner?: User.Attributes 
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

const Attributes = {
    id: {type: Sequelize.NUMBER, primaryKey: true},
    name: {type: Sequelize.STRING, allowNull: false},
    owner_id: {
        type: Sequelize.NUMBER, 
        allowNull: false, 
        references: {model: User.userTableName, key: 'id' }
    }
}

export default (sequelize: Sequelize.Sequelize) => {
    const model =  sequelize.define<Instance, Attributes>(
        tableName, Attributes
    )

    model.associate = models => {
        model.belongsTo(models.Users, {as: 'owner', foreignKey: 'owner_id'})
    }

    return model
}
