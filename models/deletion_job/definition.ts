import Sequelize from 'sequelize'
import {BaseAttributes} from '../helpers';

export const deletionJobName = 'deletion_job'

export const deletionJobTableName = 'deletion_jobs'

export interface DeletionJobAttributes extends BaseAttributes {
    id?: number,
    table_name: string,
    payload: string,
    error_count?: number //todo -- include errors
}

export type DeletionJobInstance = Sequelize.Instance<DeletionJobAttributes> & DeletionJobAttributes & BaseAttributes