
import * as Survey from './survey'
import * as Job from './job'
import * as User from './user'
import * as Member from './member'
import * as Organization from './organization'
import * as MemberSurveyPermission from './member_survey_permission'
import Sequelize from 'sequelize';

export {Types as SurveyTypes} from  './survey' 
export {Types as UserTypes} from './user'
export {Types as MemberTypes} from './member'
export {Types as OrganizationTypes} from './organization'
export {Types as MemberSurveyPermissionTypes} from './member_survey_permission'


export class Factory {

    surveyModel: Sequelize.Model<Survey.Types.Instance, Survey.Types.Attributes>

    userModel: Sequelize.Model<User.Types.Instance, User.Types.Attributes>

    memberModel: Sequelize.Model<Member.Types.Instance, Member.Types.Attributes>

    organizationModel: Sequelize.Model<Organization.Types.Instance, Organization.Types.Attributes>

    memberSurveyPermissionModel: Sequelize.Model<MemberSurveyPermission.Types.Instance, MemberSurveyPermission.Types.Attributes>

    constructor (sequelize: Sequelize.Sequelize) {
        const jobModel = Job.default(sequelize)
        this.memberModel = Member.default(sequelize)
        this.memberSurveyPermissionModel = MemberSurveyPermission.default(sequelize)
        this.surveyModel = Survey.default(sequelize, jobModel, this.memberSurveyPermissionModel)
        this.userModel = User.default(sequelize, this.memberModel, this.memberSurveyPermissionModel)
        this.organizationModel = Organization.default(sequelize, this.memberModel, this.surveyModel)
    }
}