import { expect } from 'chai';
import * as Factory from '../../models/factory'
import * as ModelTypes from '../../models'
import {getInstanceId} from '../../models/helpers'
import {initDB} from '../../database'
import * as Roles from '../../roles'
import {getDeletionRunnerFn} from '../../job'

describe('Job test', () => {

    let modelsFactory: Factory.Models
    let deletionRunnerFn: Function
    let user: ModelTypes.UserInstance
    let organization: ModelTypes.OrganizationInstance
    let survey: ModelTypes.SurveyInstance

    before('Init db', async () => {
        modelsFactory = await initDB()
        deletionRunnerFn = getDeletionRunnerFn(modelsFactory)

        user = await modelsFactory.userModel.create({name: 'user a', username: 'b', password: 'c', email: 'd'})
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