import * as chai from 'chai'
chai.use(require('chai-as-promised'))
import request from 'request'
import bluebird from 'bluebird'
import {init} from '../../index'
import {initDB} from '../../database'
import Factory from '../../models/factory'
import * as Helper from './helper'
import {Role, memberRole, adminRole} from '../../roles'

const expect = chai.expect

describe('Survey test', () => {
    type MemberInfo = {user: any, memberToken: string, organization: any}

    const promisifedRequest = bluebird.Promise.promisify(request)
    const username = 'bq23'
    const password = 'cddsw'  
    let modelsFactory: Factory
    let memberInfo: MemberInfo

    async function createMember (username: string, password: string) {
        const user = await Helper.createUser('a', username, password)
        const userToken = await Helper.createUserToken(username, password)
        const organization = await Helper.createOrganization(userToken)
        const memberToken = await Helper.createMemberToken(organization.id, userToken)
        
        return {user, memberToken, organization}
    }

    async function createLessPrivelegedMember (username: string, password: string, authMemberToken: string, role: Role = memberRole) {
        const user = await Helper.createUser('b', username, password)
        const userToken = await Helper.createUserToken(username, password)

        const member = await Helper.createMember(user.id, role, authMemberToken)

        const memberToken = await Helper.createMemberToken(member.organization_id, userToken)

        return {user, memberToken}
    }

    before('Init db and server with routes', async () => {
        modelsFactory = await initDB()
        await init(modelsFactory)
    })

    beforeEach(async () => {
        await modelsFactory.userModel.truncate()
        await modelsFactory.surveyModel.truncate()
        await modelsFactory.organizationModel.truncate()
    })

    beforeEach('create privileged member', async () => {
        memberInfo = await createMember(username, password)
    })

    describe('Create survey', () => {
        it('Survey created with proper req body', async () => {
            const survey = await Helper.createSurvey('a', memberInfo.memberToken)

            expect(survey.created_at).to.exist
            expect(survey.updated_at).to.exist
            expect(survey.deleted_at).to.not.exist
            expect(survey.id).to.be.an('number')
            expect(survey.name).to.equal('a')
        })

        it('Survey creation errors with insufficient req body', async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/surveys',
                method: 'POST',
                body: {'name_false': 'a'},
                json: true,
                headers: {'x-access-token': memberInfo.memberToken}
            })

            expect(res.statusCode).to.equal(400)
        })

        it('Survey creation errors without token', async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/surveys',
                method: 'POST',
                body: {'name': 'a'},
                json: true
            })
            expect(res.statusCode).to.equal(401)
        })

        it('Survey creation errors for unprivileged member', async () => {
            const unprivilegedMemberInfo = await createLessPrivelegedMember(username+'a', password, memberInfo.memberToken)

            const res = await promisifedRequest({
                url:'http://localhost:3000/surveys',
                method: 'POST',
                body: {'name': 'a'},
                json: true,
                headers: {'x-access-token': unprivilegedMemberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(403)
        })
    })

    describe('Find survey', () => {
        let survey: any

        beforeEach(async () => {
            survey = await Helper.createSurvey('a', memberInfo.memberToken)
        })

        it('Successfully find the survey', async () => {
            const res = await promisifedRequest({
                url: `http://localhost:3000/surveys/${survey.id}`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body).to.deep.equal(survey)
        })

        it('Fail to find missing survey', async () => {
            const fakeSurveyId = survey.id+Math.round(10*Math.random())
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${fakeSurveyId}`,
                json: true
            })
            expect(res.statusCode).to.equal(404)
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })
    })

    describe('Find surveys', () => {
        let surveys: any[]
        let otherMemberInfo: MemberInfo

        beforeEach('create member of other org', async () => {
            otherMemberInfo = await createMember(username+'c', password)
        })

        beforeEach(async () => {
            surveys = []
            surveys.push(await Helper.createSurvey('a', memberInfo.memberToken))
            surveys.push(await Helper.createSurvey('b', otherMemberInfo.memberToken))
            surveys.push(await Helper.createSurvey('c', memberInfo.memberToken))
        })

        it('Successfully find the surveys', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(3)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows).to.deep.equal(surveys)
        })

        it('Successfully find the surveys with pagination', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?page=2&size=1`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(3)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows).to.deep.equal([surveys[1]])
        })

        it('Successfully find no surveys with pagination', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?page=2&size=10`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(3)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows).to.be.empty
        })

        it('Successfully find surveys for one org', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?organization_id=${memberInfo.organization.id}`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(2)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows.length).to.equal(2)
        })

        it('Successfully find surveys for a different org', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?organization_id=${otherMemberInfo.organization.id}`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(1)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows.length).to.equal(1)
        })

        it('Successfully find paginated surveys for one org', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?organization_id=${memberInfo.organization.id}&page=1&size=1`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(2)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows.length).to.equal(1)
        })

        it('Successfully find surveys for one creator', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?creator_id=${otherMemberInfo.user.id}`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(1)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows.length).to.equal(1)
        })

        it('Error on finding surveys with incorrect pagination query', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?page=a`,
                json: true
            })
            expect(res.statusCode).to.equal(400)
        })

        it('Error on finding surveys with different incorrect pagination query', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?organization_id=1d?`,
                json: true
            })
            expect(res.statusCode).to.equal(400)
        })
    })

    describe('Patch survey', () => {
        let survey: any

        beforeEach(async () => {
            survey = await Helper.createSurvey('a', memberInfo.memberToken)
        })

        it('Successfully update the survey name', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true,
                headers: {'x-access-token': memberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.name).to.equal('grr')

            const foundSurveyRes = await promisifedRequest({
                url: `http://localhost:3000/surveys/${survey.id}`,
                json: true
            })
            expect(foundSurveyRes.statusCode).to.equal(200)
            expect(foundSurveyRes.body).to.exist
            expect(foundSurveyRes.body.name).to.equal('grr')
        })

        it('Error on updating survey without token', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true
            })
            expect(res.statusCode).to.equal(401)
        })

        it('Error on updating survey with unpriveleged member', async () => {
            const unprivilegedMemberInfo = await createLessPrivelegedMember(username+'a', password, memberInfo.memberToken)
            
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true,
                headers: {'x-access-token': unprivilegedMemberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(403)
        })

        it('Error on updating missing survey', async () => {
            const fakeSurveyId = survey.id+Math.round(10*Math.random())
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${fakeSurveyId}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true,
                headers: {'x-access-token': memberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(404)
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })

        it('Error on updating the survey with invalid name', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'PATCH',
                body: {name: null},
                json: true,
                headers: {'x-access-token': memberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(400)
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })
    })

    describe('Delete survey', () => {
        let survey: Helper.Instance

        beforeEach(async () => {
            survey = await Helper.createSurvey('a', memberInfo.memberToken)
        })

        it('Successfully delete the survey', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'DELETE',
                headers: {'x-access-token': memberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(200)

            const foundSurveyRes = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`
            })

            expect(foundSurveyRes.statusCode).to.equal(404)
        })

        it('Error on deleting survey without token', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'DELETE'
            })
            expect(res.statusCode).to.equal(401)
        })

        it('Error on deleting survey with unpriveleged member', async () => {
            const unprivilegedMemberInfo = await createLessPrivelegedMember(username+'a', password, memberInfo.memberToken)
            
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'DELETE',
                headers: {'x-access-token': unprivilegedMemberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(403)
        })

        it('Error on deleting survey with less priveleged member', async () => {
            const otherMemberInfo = await createLessPrivelegedMember(username+'c', password, memberInfo.memberToken, adminRole)
            
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'DELETE',
                headers: {'x-access-token': otherMemberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(403)
        })

        it('Error on deleting survey with non-member', async () => {
            const otherMemberInfo = await createMember(username+'c', password)
            
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'DELETE',
                headers: {'x-access-token': otherMemberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(403)
        })

        it('Fail to delete missing survey', async () => {
            const fakeSurveyId = survey.id+Math.round(10*Math.random())
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${fakeSurveyId}`,
                method: 'DELETE',
                headers: {'x-access-token': memberInfo.memberToken}
            })
            expect(res.statusCode).to.equal(404)
        })
    })
})