import Sequelize from 'sequelize'

export interface BaseAttributes {
    id?:number
}

export interface BaseMethods {
    getId(): number
}

type BaseInstance = Sequelize.Instance<BaseAttributes> & BaseAttributes

export const dbOptions = {
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    instanceMethods: {
        getId (): number {
            if (!this.id) {
                throw new TypeError(`no instance id on ${this.Model.name}`)
            }
        
            return this.id
        }
    }
}