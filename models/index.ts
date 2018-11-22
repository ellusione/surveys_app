
import * as Survey from './survey'
import * as DeletionJob from './deletion_job'
import * as User from './user'
import * as Member from './member'
import * as Organization from './organization'
import * as MemberSurveyPermission from './member_survey_permission'
import Sequelize from 'sequelize';

export * from  './survey' 
export * from './user'
export * from './member'
export * from './organization'
export * from './member_survey_permission'


export class Factory {

    sequelize: Sequelize.Sequelize

    deletionJobModel: Sequelize.Model<DeletionJob.DeletionJobInstance, DeletionJob.DeletionJobAttributes>

    surveyModel: Sequelize.Model<Survey.SurveyInstance, Survey.SurveyAttributes>

    userModel: Sequelize.Model<User.UserInstance, User.UserAttributes>

    memberModel: Sequelize.Model<Member.MemberInstance, Member.MemberAttributes>

    organizationModel: Sequelize.Model<Organization.OrganizationInstance, Organization.OrganizationAttributes>

    memberSurveyPermissionModel: Sequelize.Model<MemberSurveyPermission.MemberSurveyPermissionInstance, MemberSurveyPermission.MemberSurveyPermissionAttributes>

    constructor (sequelize: Sequelize.Sequelize) {
        this.sequelize = sequelize

        //this.deletionJobModel = DeletionJob.default(sequelize)
        this.memberModel = Member.default(sequelize)
        this.memberSurveyPermissionModel = MemberSurveyPermission.default(sequelize)
        this.surveyModel = Survey.default(sequelize, this.deletionJobModel)
        this.userModel = User.default(sequelize, this.memberModel, this.memberSurveyPermissionModel)
        this.organizationModel = Organization.default(sequelize, this.memberModel, this.surveyModel)
    }
}