import Sequelize from 'sequelize'
import {dbOptions} from '../helpers';
import {SQL} from '../helpers'
import * as Definition from './definition'

const sqlStatements: SQL = {
    drop: `DROP TABLE IF EXISTS deletion_jobs`,
    create: `CREATE TABLE deletion_jobs (
        id SERIAL PRIMARY KEY,
        table_name character varying(255) NOT NULL,
        payload character varying(255) NOT NULL,
        error_count integer DEFAULT 0 NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL,
        deleted_at timestamp with time zone
    )`,
    additionalConstraints: []
}

const sequelizeAttributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    table_name: {type: Sequelize.STRING, allowNull: false},
    payload: {type: Sequelize.STRING, allowNull: false},
    error_count: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0}
}

export default (sequelize: Sequelize.Sequelize) => {

    const model =  sequelize.define<Definition.DeletionJobInstance, Definition.DeletionJobAttributes>(
        Definition.deletionJobTableName, sequelizeAttributes, dbOptions
    )

    return {model, sqlStatements}
}