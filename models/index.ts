
import * as Database from './database'
import * as Survey from './survey'
import * as User from './user'
import * as Member from './member'
import * as Organization from './organization'
import Sequelize from 'sequelize';

export class Models {

    surveyModel: Sequelize.Model<Survey.Instance, Survey.Attributes>

    userModel: Sequelize.Model<User.Instance, User.Attributes>

    memberModel: Sequelize.Model<Member.Instance, Member.Attributes>

    organizationModel: Sequelize.Model<Organization.Instance, Organization.Attributes>

    constructor () {
        Database.init().then((sequelize) => {
            this.surveyModel = Survey.default(sequelize)
            this.userModel = User.default(sequelize)
            this.memberModel = Member.default(sequelize)
            this.organizationModel = Organization.default(sequelize)
    
            sequelize.sync()
        })
    }
}