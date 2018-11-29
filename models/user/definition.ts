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

export const userSqlStatement = `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    UNIQUE INDEX username
    ON users(username)
    WHERE deleted_at IS NOT NULL,
    UNIQUE INDEX email
    ON users(email)
    WHERE deleted_at IS NOT NULL
)`