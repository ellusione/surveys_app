import Sequelize from 'sequelize'

export const userTableName = 'users'

export interface Attributes {
    id?: number,
    name: string
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

const Attributes = {
    id: {type: Sequelize.NUMBER, primaryKey: true},
    name: {type: Sequelize.STRING, allowNull: false}
}

export default (sequelize: Sequelize.Sequelize) => {
    const model =  sequelize.define<Instance, Attributes>(
        userTableName, Attributes
    )

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return model
}