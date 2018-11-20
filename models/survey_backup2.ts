import Sequelize from 'sequelize'

export default (sequelize: Sequelize.Sequelize) => {
    return sequelize.define(
        'surveys', {
            id: {type: Sequelize.NUMBER, primaryKey: true},
            name: {type: Sequelize.STRING, allowNull: false},
            owner_id: {
                type: Sequelize.NUMBER, 
                allowNull: false, 
                references: {model: 'users', key: 'id' }
            }
        }
    )
}
