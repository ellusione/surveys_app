
import * as Survey from './survey/model'
import * as SurveyDefinition from './survey/definition'
import * as DeletionJob from './deletion_job/model'
import * as DeletionJobDefinition from './deletion_job/definition'
import * as User from './user/model'
import * as UserDefinition from './user/definition'
import * as Member from './member/model'
import * as MemberDefinition from './member/definition'
import * as Organization from './organization/model'
import * as OrganizationDefinition from './organization/definition'
import * as MemberSurveyPermission from './member_survey_permission/model'
import * as MemberSurveyPermissionDefinition from './member_survey_permission/definition'

import Sequelize from 'sequelize';

export * from  './survey/definition' 
export * from './user/definition'
export * from './member/definition'
export * from './organization/definition'
export * from './member_survey_permission/definition'


export class Factory {

    sequelize: Sequelize.Sequelize

    deletionJobModel: Sequelize.Model<DeletionJobDefinition.DeletionJobInstance, DeletionJobDefinition.DeletionJobAttributes>

    surveyModel: Sequelize.Model<SurveyDefinition.SurveyInstance, SurveyDefinition.SurveyAttributes>

    userModel: Sequelize.Model<UserDefinition.UserInstance, UserDefinition.UserAttributes>

    memberModel: Sequelize.Model<MemberDefinition.MemberInstance, MemberDefinition.MemberAttributes>

    organizationModel: Sequelize.Model<OrganizationDefinition.OrganizationInstance, OrganizationDefinition.OrganizationAttributes>

    memberSurveyPermissionModel: Sequelize.Model<MemberSurveyPermissionDefinition.MemberSurveyPermissionInstance, MemberSurveyPermissionDefinition.MemberSurveyPermissionAttributes>

    constructor (sequelize: Sequelize.Sequelize) {
        this.sequelize = sequelize

        this.deletionJobModel = DeletionJob.default(sequelize)
        this.memberModel = Member.default(sequelize)
        this.memberSurveyPermissionModel = MemberSurveyPermission.default(sequelize)
        this.surveyModel = Survey.default(sequelize, this.deletionJobModel)
        this.userModel = User.default(sequelize, this.memberModel, this.memberSurveyPermissionModel)
        this.organizationModel = Organization.default(sequelize, this.memberModel, this.surveyModel)
    }
}