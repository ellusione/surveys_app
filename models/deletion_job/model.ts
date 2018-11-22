import Sequelize from 'sequelize'
import {dbOptions} from '../helpers';
import * as Definition from './definition'

const sequelizeAttributes = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    table_name: {type: Sequelize.STRING, allowNull: false},
    payload: {type: Sequelize.JSON, allowNull: false},
    error_count: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0}
}

export default (sequelize: Sequelize.Sequelize) => {

    const model =  sequelize.define<Definition.DeletionJobInstance, Definition.DeletionJobAttributes>(
        Definition.deletionJobTableName, sequelizeAttributes, dbOptions
    )

    return model
}