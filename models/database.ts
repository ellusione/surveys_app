
import Sequelize from 'sequelize'

const sequelize = new Sequelize(
    'postgres://postgres:123@localhost:5432/surveys',
    { dialect: 'postgres' }
)

export const dbOptions = {
    timestamps: true,
    freezeTableName: true,
    paranoid: true
}

export async function init(): Promise<Sequelize.Sequelize> {
    await sequelize.authenticate()
    console.log("db connection successful")
    return sequelize
}
    
