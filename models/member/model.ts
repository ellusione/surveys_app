import Sequelize from 'sequelize'
//import lodash from 'lodash'
import * as  OrganizationDefinition from '../organization/definition';
import * as UserDefinition from '../user/definition'
import {Role} from '../../roles'
import {dbOptions} from '../helpers';
import * as Definition from './definition'

const sequelizeAttributes = {
    id: {
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: UserDefinition.userTableName, key: 'id' },
        unique: 'unq_user_org'
    },
    organization_id: {
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: {model: OrganizationDefinition.organizationTableName, key: 'id' },
        unique: 'unq_user_org'
    },
    role_id: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        validate: {min: 1, max: Role.allRoles.size}
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
    deleted_at: {type: Sequelize.DATE, unique: 'unq_user_org' }
}

export default (sequelize: Sequelize.Sequelize) => {
    // const options = lodash.merge({}, dbOptions, {
    //     indexes: [
    //         {fields: ['user_id', 'organization_id', 'deleted_at'], unique: true}
    //     ]
    // })

    const model = sequelize.define<Definition.MemberInstance, Definition.MemberAttributes>(
        Definition.memberTableName, sequelizeAttributes, dbOptions
    )

    model.associate = models => {
        model.belongsTo(models.Users, {
            as: 'user', foreignKey: 'user_id'
        })
        model.belongsTo(models.Organizations, {
            as: 'organization', foreignKey: 'organization_id'
        })
    }

    return model
}