import * as Models from '../models'
import {getInstanceId} from '../models/helpers'
import {initDB} from '../database'
import * as Roles from '../roles'
import {getDeletionRunnerFn} from '../job'
import { expect } from 'chai';

describe('Survey test', () => {

    let modelsFactory: Models.Factory
    let deletionRunnerFn: Function
    let user: Models.UserInstance
    let organization: Models.OrganizationInstance
    let survey: Models.SurveyInstance

    before('Init db', async () => {
        modelsFactory = await initDB()
        deletionRunnerFn = getDeletionRunnerFn(modelsFactory)

        user = await modelsFactory.userModel.create({name: 'user a'})
        organization = await modelsFactory.organizationModel.create({name: 'org b'})
    })

    beforeEach(async () => {
        survey = await modelsFactory.surveyModel.create({
            name: 'a', creator_id: getInstanceId(user), organization_id: getInstanceId(organization)
        })
    })

    beforeEach(async () => {
        await survey.destroy()
    })

    it('Delete survey should call destroy MemberSurveyPermission deletion hook', async () => {
        const memberSurveyPermission = await modelsFactory.memberSurveyPermissionModel.create({
            user_id: getInstanceId(user),
            survey_id: getInstanceId(survey),
            role_id: Roles.adminRole.id
        })

        const foundPermission = await modelsFactory.memberSurveyPermissionModel.findById(memberSurveyPermission.id)

        expect(foundPermission).to.exist

        await survey.destroy()

        await deletionRunnerFn()

        const foundPermissionAfterJob = await modelsFactory.memberSurveyPermissionModel.findById(memberSurveyPermission.id)

        expect(foundPermissionAfterJob).to.not.exist
    })
})