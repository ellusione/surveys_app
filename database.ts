
import Sequelize from 'sequelize'
import ModelsFactory from './models'

const sequelize = new Sequelize(
    'postgres://postgres:123@localhost:5432/surveys',
    { dialect: 'postgres' }
)

export const dbOptions = {
    timestamps: true,
    freezeTableName: true,
    paranoid: true
}

export async function initDB(): Promise<ModelsFactory> {
    await sequelize.authenticate()
    console.log("DB connection successful")
    
    const modelsFactory = await new ModelsFactory(sequelize)
    await sequelize.sync({force: true})
    return modelsFactory
}

    
