import Sequelize from 'sequelize'

export const tableName = 'organizations'

export interface Attributes {
    id?: number,
    name: string
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

const Attributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true},
    name: {type: Sequelize.STRING, allowNull: false}
}

export default (sequelize: Sequelize.Sequelize) => {
    const model =  sequelize.define<Instance, Attributes>(
        tableName, Attributes
    )

    model.associate = models => {
        model.hasMany(models.Surveys)
    }

    return model
}