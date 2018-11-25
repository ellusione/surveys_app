
import Sequelize from 'sequelize'
import Factory from './models/factory'
//import * as config from './config'

// const a = `postgres//${config.DATABASE.username}:${config.DATABASE.password}@${config.DATABASE.host}:${config.DATABASE.port}/surveys`

const sequelize = new Sequelize('postgres://postgres:123@localhost:5432/surveys',
    { dialect: 'postgres' }
)

export async function initDB(): Promise<Factory> {
    await sequelize.authenticate()
    console.log("DB connection successful")
    
    const modelsFactory = await new Factory(sequelize)
    await sequelize.sync({force: true})

    console.log("Sequelize sync successful")
    return modelsFactory
}

    
