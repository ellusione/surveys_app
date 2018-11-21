
import * as Database from './database'
import * as Survey from './survey'
import * as User from './user'
import * as Member from './member'
import * as Organization from './organization'
import * as MemberSurveyPermission from './member_survey_permission'
import Sequelize from 'sequelize';

export default class ModelsFactory {

    surveyModel: Sequelize.Model<Survey.Instance, Survey.Attributes>

    userModel: Sequelize.Model<User.Instance, User.Attributes>

    memberModel: Sequelize.Model<Member.Instance, Member.Attributes>

    organizationModel: Sequelize.Model<Organization.Instance, Organization.Attributes>

    memberSurveyPermissionModel: Sequelize.Model<MemberSurveyPermission.Instance, MemberSurveyPermission.Attributes>

    constructor () {
        Database.init()
            .catch((err: Error) => {
                console.error("DB connection unsuccessful", err)
                throw err
            })
            .then((sequelize) => {
                this.memberModel = Member.default(sequelize)
                this.memberSurveyPermissionModel = MemberSurveyPermission.default(sequelize)
                this.surveyModel = Survey.default(sequelize, this.memberSurveyPermissionModel)
                this.userModel = User.default(sequelize, this.memberModel, this.memberSurveyPermissionModel)
                this.organizationModel = Organization.default(sequelize, this.memberModel, this.surveyModel)
        
                sequelize.sync({force: true})
            })
            .catch((err: Error) => {
                console.error("Initialization error", err)
                throw err
            })
    }
}