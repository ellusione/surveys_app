
import Sequelize from 'sequelize'
import * as Models from './models'
import * as config from './config'

const sequelize = new Sequelize(
    `${config.DATABASE.username}://${config.DATABASE.password}@${config.DATABASE.host}:${config.DATABASE.port}/surveys`,
    { dialect: 'postgres' }
)

export async function initDB(): Promise<Models.Factory> {
    await sequelize.authenticate()
    console.log("DB connection successful")
    
    const modelsFactory = await new Models.Factory(sequelize)
    await sequelize.sync({force: true})

    console.log("Sequelize sync successful")
    return modelsFactory
}

    
