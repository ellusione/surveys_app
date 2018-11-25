import * as chai from 'chai'
chai.use(require('chai-as-promised'))
import request from 'request'
import bluebird from 'bluebird'
import {init} from '../../index'
import {initDB} from '../../database'
import Factory from '../../models/factory'

const expect = chai.expect

describe('Survey test', () => {
    type Survey = {id: number} //imperfect
    const promisifedRequest = bluebird.Promise.promisify(request)
    let modelsFactory: Factory
    
    async function makeSurvey (name: string) {
        const res = await promisifedRequest({
            url:'http://localhost:3000/surveys',
            method: 'POST',
            body: {name},
            json: true
        })
        expect(res.statusCode).to.equal(200)
        expect(res.body).to.exist
        return res.body
    }

    before('Init db and server with routes', async () => {
        modelsFactory = await initDB()
        await init(modelsFactory)
    })

    beforeEach(async () => {
        await modelsFactory.surveyModel.truncate()
    })

    describe('Create survey', () => {
        it('Survey creation errors with insufficient req body', async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/surveys',
                method: 'POST',
                body: {'name_false': 'a'},
                json: true
            })

            expect(res.statusCode).to.equal(400)
            
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })

        it('Survey created with proper req body', async () => {
            const survey = await makeSurvey('a')

            expect(survey.created_at).to.exist
            expect(survey.updated_at).to.exist
            expect(survey.deleted_at).to.not.exist
            expect(survey.id).to.be.an('number')
            expect(survey.name).to.equal('a')
        })
    })

    describe('Find survey', () => {
        let survey: Survey

        beforeEach(async () => {
            survey = await makeSurvey('a')
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
        let surveys: Survey[]

        beforeEach(async () => {
            surveys = []
            surveys.push(await makeSurvey('a'))
            surveys.push(await makeSurvey('b'))
            surveys.push(await makeSurvey('c'))
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

        it('Error on finding surveys with incorrect pagination query', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/surveys?page=a`,
                json: true
            })
            expect(res.statusCode).to.equal(400)
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })
    })

    describe('Patch survey', () => {
        let survey: Survey

        beforeEach(async () => {
            survey = await makeSurvey('a')
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
        let survey: Survey

        beforeEach(async () => {
            survey = await makeSurvey('a')
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