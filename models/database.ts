
import Sequelize from 'sequelize'

const sequelize = new Sequelize(
    'postgres://postgres:123@localhost:5432/surveys',
    { dialect: 'postgres' }
)

export function init(): Promise<Sequelize.Sequelize> {
    return sequelize
        .authenticate()
        .then(() => {
            console.log("db connection successful")
            return sequelize
        })
        .catch((err) => {
            console.error("db connection unsuccessful", err)
            throw err
        })
}
    
