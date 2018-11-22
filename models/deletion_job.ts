import Sequelize from 'sequelize'
import {BaseAttributes, dbOptions} from './helpers';

const deletionJobTableName = 'deletion_jobs'

export interface DeletionJobAttributes extends BaseAttributes {
    id?: number,
    table_name: string,
    payload: string,
    error_count?: number //todo -- include errors
}

export type DeletionJobInstance = Sequelize.Instance<DeletionJobAttributes> & DeletionJobAttributes & BaseAttributes

const sequelizeAttributes: Sequelize.DefineModelAttributes<DeletionJobAttributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    table_name: {type: Sequelize.STRING, allowNull: false},
    payload: {type: Sequelize.JSON, allowNull: false},
    error_count: {type: Sequelize.JSON, allowNull: false, defaultValue: 0}
}

export default (sequelize: Sequelize.Sequelize) => {

    const model =  sequelize.define<DeletionJobInstance, DeletionJobAttributes>(
        deletionJobTableName, sequelizeAttributes, dbOptions
    )

    return model
}