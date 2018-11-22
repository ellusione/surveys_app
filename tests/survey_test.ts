import * as chai from 'chai'
import * as uuid from 'uuid'
chai.use(require('chai-as-promised'))
import * as Models from '../models'
import * as MemberSurveyPermissionDefinition from '../models/member_survey_permission/definition'
import {getInstanceId} from '../models/helpers'
import {initDB} from '../database'
import * as Roles from '../roles'
const expect = chai.expect

describe('Survey test', () => {

    let modelsFactory: Models.Factory
    let user: Models.UserInstance
    let organization: Models.OrganizationInstance
    let survey: Models.SurveyInstance

    before('Init db', async () => {
        modelsFactory = await initDB()
        user = await modelsFactory.userModel.create({name: 'user a'})
        organization = await modelsFactory.organizationModel.create({name: 'org b'})
    })

    beforeEach(async () => {
        survey = await modelsFactory.surveyModel.create({
            name: 'a', creator_id: getInstanceId(user), organization_id: getInstanceId(organization)
        })
    })

    describe('Find survey', () => {
        it('Should find saved survey', async () => {
            expect(survey.creator_id).to.exist
            expect(survey.creator_id).to.equal(user.id)

            expect(survey.name).to.equal('a')

            expect(survey.organization_id).to.exist
            expect(survey.organization_id).to.equal(organization.id)

            expect(survey.id).to.exist

            const foundRes = await modelsFactory.surveyModel.findById(survey.id)

            expect(foundRes).to.exist
        })
    })

    describe('Update survey', () => {
        it('Should throw error on invalid creator_id update', () => {
            const fakeCreatorId = survey.creator_id + Math.random()*100
            expect(survey.update({creator_id: fakeCreatorId})).to.eventually.throw(Error)
        })

        it('Should save survey on valid name update', async () => {
            const newName = uuid.v4()
            await survey.update({
                name: newName
            })

            expect(survey.name).to.equal(newName)

            const foundRes = await modelsFactory.surveyModel.findById(survey.id)

            if (!foundRes) { //fix me, more concise
                throw new Error('no res')
            }
            expect(foundRes.name).to.equal(newName)
        })
    })
    
    describe('Delete survey', () => {
        beforeEach(async () => {
            await survey.destroy()
        })

        it('Should delete survey', async () => {
            const foundRes = await modelsFactory.surveyModel.findById(survey.id)

            expect(foundRes).to.not.exist
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

            const foundDeletionJob = await modelsFactory.deletionJobModel.findOne({
                where: {
                    table_name: MemberSurveyPermissionDefinition.memberSurveyPermissionTableName,
                    error_count: 0,
                    payload: JSON.stringify({
                        survey_id: getInstanceId(survey) 
                    })
                }
            })

            expect(foundDeletionJob).to.exist
        })
    })

})