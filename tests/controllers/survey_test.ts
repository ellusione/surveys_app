import * as chai from 'chai'
chai.use(require('chai-as-promised'))
import request from 'request'
import bluebird from 'bluebird'
import {init} from '../../index'
import {initDB} from '../../database'
import Factory from '../../models/factory'
import * as Helper from './helper'
import {memberRole, Role} from '../../roles'

const expect = chai.expect

describe('Survey test', () => {
    const promisifedRequest = bluebird.Promise.promisify(request)
    const username = 'bq23'
    const password = 'cddsw'  
    let modelsFactory: Factory
    let memberToken: string

    async function createPrivelegedMember (username: string, password: string) {
        const user = await Helper.createUser('a', username, password)
        const userToken = await Helper.createUserToken(username, password)
        const organization = await Helper.createOrganization(userToken)
        const memberToken = Helper.createMemberToken(organization.id, userToken)
        
        return {
            user,
            memberToken,
            organization
        }
    }

    async function createUnprivilegedMemberToken (username: string, password: string, authMemberToken: string) {
        const unprivilegedUser = await Helper.createUser('b', username, password)
        const userToken = await Helper.createUserToken(username, password)

        const member = await Helper.createMember(unprivilegedUser.id, memberRole, authMemberToken)

        const memberToken = Helper.createMemberToken(member.organization_id, userToken)

        return {
            memberToken,
            organization
        }
    }

    before('Init db and server with routes', async () => {
        modelsFactory = await initDB()
        await init(modelsFactory)
    })

    beforeEach(async () => {
        await modelsFactory.userModel.truncate()
        await modelsFactory.surveyModel.truncate()
    })

    beforeEach('create privileged member', async () => {
        memberToken = await createMemberToken(username, password)
    })

    describe('Create survey', () => {
        let unprivilegedMemberToken: string
    
        beforeEach('create unprivileged member', async () => {
            unprivilegedMemberToken = await createUnprivilegedMemberToken(username+'a', password, memberToken)
        })

        it('Survey created with proper req body', async () => {
            const survey = await Helper.createSurvey('b', memberToken)

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
                headers: {'x-access-token': memberToken}
            })

            expect(res.statusCode).to.equal(400)
        })

        it('Survey creation errors for unprivileged member', async () => {
            const res = await Helper.createSurvey('b', unprivilegedMemberToken)
            expect(res.statusCode).to.equal(401)
        })
    })

    describe('Find survey', () => {
        let survey: Helper.Instance

        beforeEach(async () => {
            survey = await Helper.createSurvey('a', memberToken)
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
        let surveys: Helper.Instance[]

        let otherMemberToken: string

        beforeEach('create member of other org', async () => {
            otherMemberToken = await createMemberToken(username+'c', password)
        })

        beforeEach(async () => {
            surveys = []
            surveys.push(await Helper.createSurvey('a', memberToken))
            surveys.push(await Helper.createSurvey('b', otherMemberToken))
            surveys.push(await Helper.createSurvey('c', memberToken))
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
                url:`http://localhost:3000/surveys?organization_id=${}`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(3)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows).to.be.empty
        })

        it('Error on finding surveys with incorrect pagination query', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?page=a`,
                json: true
            })
            expect(res.statusCode).to.equal(400)
        })
    })

    describe('Patch survey', () => {
        let survey: Helper.Instance

        beforeEach(async () => {
            survey = await Helper.makeSurvey('a')
        })

        it('Successfully update the survey name', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true
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

        it('Error on updating missing survey', async () => {
            const fakeSurveyId = survey.id+Math.round(10*Math.random())
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${fakeSurveyId}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true
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
                json: true
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
            survey = await Helper.makeSurvey('a')
        })

        it('Successfully delete the survey', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`,
                method: 'DELETE'
            })
            expect(res.statusCode).to.equal(200)

            const foundSurveyRes = await promisifedRequest({
                url:`http://localhost:3000/surveys/${survey.id}`
            })

            expect(foundSurveyRes.statusCode).to.equal(404)
        })

        it('Fail to delete missing survey', async () => {
            const fakeSurveyId = survey.id+Math.round(10*Math.random())
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys/${fakeSurveyId}`,
                method: 'DELETE'
            })
            expect(res.statusCode).to.equal(404)
        })
    })
})