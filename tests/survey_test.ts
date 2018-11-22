import * as Models from '../models'
import {getInstanceId} from '../models/helpers'
import {initDB} from '../database'
import * as Roles from '../roles'
import { expect } from 'chai';

describe('Survey test', () => {

    let modelsFactory: Models.ModelsFactory
    let user: Models.UserTypes.Instance
    let organization: Models.OrganizationTypes.Instance
    let member: Models.MemberTypes.Instance

    before('Init db', async () => {
        modelsFactory = await initDB()
        user = await modelsFactory.userModel.create({name: 'user a'})
        organization = await modelsFactory.organizationModel.create({name: 'org b'})
        
        member = await modelsFactory.memberModel.create({
            user_id: getInstanceId(user), 
            organization_id: getInstanceId(organization), 
            role_id: Roles.memberRole.id
        })
    })

    describe('Create survey', () => {
        let survey: Models.SurveyTypes.Instance

        beforeEach(async () => {
            survey = await modelsFactory.surveyModel.create({
                name: 'a', creator_id: getInstanceId(user), organization_id: getInstanceId(organization)
            })
        })
        it('Should save survey', async () => {
            const result = await modelsFactory.surveyModel.create({
                name: 'a', creator_id: getInstanceId(user), organization_id: getInstanceId(organization)
            })
            expect(result.creator_id).to.exist
            expect(result.creator_id).to.equal(user.id)

            expect(result.name).to.equal('a')

            expect(result.organization_id).to.exist
            expect(result.organization_id).to.equal(organization.id)

            expect(result.id).to.exist

            const foundRes = await modelsFactory.surveyModel.findById(result.id)

            expect(foundRes).to.exist
        })
    })

    it('Should delete survey', async () => {
        const result = await modelsFactory.surveyModel.create({
            name: 'a', creator_id: getInstanceId(user), organization_id: getInstanceId(organization)
        })

        await result.destroy()

        const foundRes = await modelsFactory.surveyModel.findById(result.id)

        expect(foundRes).to.not.exist
    })

    it('Delete survey should call hook', async () => {
        const result = await modelsFactory.surveyModel.create({
            name: 'a', creator_id: getInstanceId(user), organization_id: getInstanceId(organization)
        })

       const memberSurveyPermission = await modelsFactory.memberSurveyPermissionModel.create({
            user_id: getInstanceId(user),
            survey_id: getInstanceId(result),
            role_id: Roles.adminRole.id
        })

        const foundPermission = await modelsFactory.memberSurveyPermissionModel.findById(memberSurveyPermission.id)

        expect(foundPermission).to.exist

        await result.destroy()

        const foundPermissionAfterDelete = await modelsFactory.memberSurveyPermissionModel.findById(memberSurveyPermission.id)

        expect(foundPermissionAfterDelete).to.not.exist
    })

})