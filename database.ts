
import Sequelize from 'sequelize'
import * as Models from './models'

const sequelize = new Sequelize(
    'postgres://postgres:123@localhost:5432/surveys',
    { dialect: 'postgres' }
)

export async function initDB(): Promise<Models.Factory> {
    await sequelize.authenticate()
    console.log("DB connection successful")
    
    const modelsFactory = await new Models.Factory(sequelize)
    await sequelize.sync({force: true})
    return modelsFactory
}

    
