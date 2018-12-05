
import Sequelize from 'sequelize'
import * as Factory from './models/factory'
//import * as config from './config'

// const a = `postgres//${config.DATABASE.username}:${config.DATABASE.password}@${config.DATABASE.host}:${config.DATABASE.port}/surveys`

const sequelize = new Sequelize('postgres://postgres:123@localhost:5432/surveys',
    { dialect: 'postgres' }
)

let modelsFactory: Factory.Models | null = null

export async function initDB(): Promise<Factory.Models> {

    if (modelsFactory) {
        return modelsFactory
    }
    
    await sequelize.authenticate()
    console.log("DB connection successful")
    
    modelsFactory = await Factory.default(sequelize)

    console.log("Sequelize sync successful")
    return modelsFactory
}

    
