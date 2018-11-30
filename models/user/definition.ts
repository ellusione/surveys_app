import Sequelize from 'sequelize'
import { BaseAttributes } from '../helpers';

export const userName = 'user'

export const userTableName = 'users'

export interface UserAttributes extends BaseAttributes {
    id?: number,
    name: string,
    username: string,
    password: string,
    email: string
}

export type UserInstance = Sequelize.Instance<UserAttributes> & UserAttributes & BaseAttributes
