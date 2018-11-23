import Sequelize from 'sequelize'

export interface BaseAttributes {
    id?:number
}

type BaseInstance = Sequelize.Instance<BaseAttributes> & BaseAttributes 

export function getInstanceId (instance: BaseInstance): number {
    if (!instance.id) {
        throw new TypeError(`${instance.Model.name} has no instance id`)
    }

    return instance.id
}

export const dbOptions = {
    timestamps: true,
    freezeTableName: true,
    paranoid: true
}


