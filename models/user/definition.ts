import Sequelize from 'sequelize'
import { BaseAttributes } from '../helpers';

export const userTableName = 'users'

export interface UserAttributes extends BaseAttributes {
    id?: number,
    name: string
}

export type UserInstance = Sequelize.Instance<UserAttributes> & UserAttributes & BaseAttributes