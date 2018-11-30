import Sequelize from 'sequelize'
import sequelize = require('sequelize');

export interface BaseAttributes {
    id?:number
}

export type BaseInstance = Sequelize.Instance<BaseAttributes> & BaseAttributes 

export type SQL = {
    drop: string,
    create: string,
    constraints: string[]
    dropForeignConstraints: string[]
}

export type ModelBuildingFn = (s: sequelize.Sequelize) => {model: sequelize.Model<BaseInstance, BaseAttributes>, sqlStatements: SQL}

export function getInstanceId (instance: BaseInstance): number {
    if (!instance.id) {
        throw new TypeError(`${instance.Model.name} has no instance id`)
    }

    return instance.id
}

export const dbOptions = {
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    underscored: true
}


