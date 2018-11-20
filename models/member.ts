import Sequelize from 'sequelize'
import * as  Organization from './organization';
import * as User from './user'

export const memberTableName = 'members'

export interface Attributes {
    id?: number,
    member_id: number,
    member?: User.Attributes,
    organization_id: number,
    organization?: Organization.Attributes,
    role_id: number
}

export type Instance = Sequelize.Instance<Attributes> & Attributes

const Attributes = {
    id: {type: Sequelize.NUMBER, primaryKey: true},
    member_id: {
        type: Sequelize.NUMBER, 
        allowNull: false, 
        references: {model: User.userTableName, key: 'id' }
    },
    organization_id: {
        type: Sequelize.NUMBER, 
        allowNull: false, 
        references: {model: Organization.tableName, key: 'id' }
    },
    role_id: {type: Sequelize.NUMBER, allowNull: false} //validation function
}

export default (sequelize: Sequelize.Sequelize) => {
    return sequelize.define<Instance, Attributes>(
        memberTableName, Attributes
    )
}