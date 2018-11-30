
import Sequelize from 'sequelize';
import {BaseInstance, BaseAttributes, SQL} from './helpers'
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

export type Models = {
    sequelize: Sequelize.Sequelize

    deletionJobModel: Sequelize.Model<DeletionJobDefinition.DeletionJobInstance, DeletionJobDefinition.DeletionJobAttributes>

    surveyModel: Sequelize.Model<SurveyDefinition.SurveyInstance, SurveyDefinition.SurveyAttributes>

    userModel: Sequelize.Model<UserDefinition.UserInstance, UserDefinition.UserAttributes>

    memberModel: Sequelize.Model<MemberDefinition.MemberInstance, MemberDefinition.MemberAttributes>

    organizationModel: Sequelize.Model<OrganizationDefinition.OrganizationInstance, OrganizationDefinition.OrganizationAttributes>

    memberSurveyPermissionModel: Sequelize.Model<MemberSurveyPermissionDefinition.MemberSurveyPermissionInstance, MemberSurveyPermissionDefinition.MemberSurveyPermissionAttributes>
}

export default async function initModels (sequelize: Sequelize.Sequelize): Promise<Models> {

    const modelsInfo: Array<{model: Sequelize.Model<BaseInstance, BaseAttributes>, sqlStatements: SQL}> = []

    const deletionJobModelInfo = DeletionJob.default(sequelize)
    modelsInfo.push(deletionJobModelInfo)
    const memberSurveyPermissionModelInfo = MemberSurveyPermission.default(sequelize)
    modelsInfo.push(memberSurveyPermissionModelInfo)
    const userModelInfo = User.default(sequelize, deletionJobModelInfo.model)
    modelsInfo.push(userModelInfo)
    const organizationModelInfo = Organization.default(sequelize, deletionJobModelInfo.model)
    modelsInfo.push(organizationModelInfo)
    const surveyModelInfo = Survey.default(sequelize, deletionJobModelInfo.model)
    modelsInfo.push(surveyModelInfo)
    const memberModelInfo = Member.default(sequelize)
    modelsInfo.push(memberModelInfo)

    for (const info of modelsInfo) {
        await sequelize.query(info.sqlStatements.drop)
    }

    for (const info of modelsInfo) {
        await sequelize.query(info.sqlStatements.create)
    }

    for (const info of modelsInfo) {
        for (const constraint of info.sqlStatements.additionalConstraints) {
            await sequelize.query(constraint)
        }
    }

    return {
        sequelize,
        deletionJobModel: deletionJobModelInfo.model,
        memberModel: memberModelInfo.model,
        memberSurveyPermissionModel: memberSurveyPermissionModelInfo.model,
        surveyModel: surveyModelInfo.model,
        userModel: userModelInfo.model,
        organizationModel: organizationModelInfo.model
    }
}