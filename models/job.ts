import Sequelize, { json } from 'sequelize'
import * as Survey from './survey'
import * as Member from './member'
import * as MemberSurveyPermission from './member_survey_permission'
import {BaseAttributes, dbOptions, getInstanceId} from './helpers';

export module Types {
    export const tableName = 'jobs'

    export interface Attributes extends BaseAttributes {
        id?: number,
        table_name: string,
        payload: string
    }

    export type Instance = Sequelize.Instance<Attributes> & Attributes & BaseAttributes
}

const sequelizeAttributes: Sequelize.DefineModelAttributes<Types.Attributes> = {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    table_name: {type: Sequelize.STRING, allowNull: false},
    payload: {type: Sequelize.JSON, allowNull: false}
}

export default (sequelize: Sequelize.Sequelize) => {

    const model =  sequelize.define<Types.Instance, Types.Attributes>(
        Types.tableName, sequelizeAttributes, dbOptions
    )

    return model
}