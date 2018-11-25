import * as chai from 'chai'
chai.use(require('chai-as-promised'))
import request from 'request'
import bluebird from 'bluebird'
import {init} from '../../index'
import {initDB} from '../../database'
import Factory from '../../models/factory'
import uuid = require('uuid');

const expect = chai.expect

describe('Token test', () => {
    const promisifedRequest = bluebird.Promise.promisify(request)
    const username = 'b'
    const password = 'c'    
    let modelsFactory: Factory
    
    async function makeUser (name: string, username: string, password: string) {
        const res = await promisifedRequest({
            url:'http://localhost:3000/users',
            method: 'POST',
            body: {name, username, password},
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
        await modelsFactory.userModel.truncate()
    })

    beforeEach(async () => {
        await makeUser('a', username, password)
    })

    describe('Create user token', () => {

        it('Token request fails with wrong password', async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/user_tokens',
                method: 'POST',
                body: {username, password: 'wrong'},
                json: true
            })

            expect(res.statusCode).to.equal(401)
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })

        it('Token request fails with wrong username', async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/user_tokens',
                method: 'POST',
                body: {username: 'wrong', password},
                json: true
            })

            expect(res.statusCode).to.equal(401)
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })

        it('Token request success', async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/user_tokens',
                method: 'POST',
                body: {username, password},
                json: true
            })

            expect(res.statusCode).to.equal(200)
            expect(res.body).to.be.an('string')
        })
    })

    describe('Create member token', () => {
        let userToken: string 
        let organizationId: number

        beforeEach(async () => {
            await makeUser('a', username, password)
        })

        beforeEach(async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/user_tokens',
                method: 'POST',
                body: {username, password},
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.be.an('string')
            userToken = res.body
        })

        beforeEach(async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/organizations',
                method: 'POST',
                body: {name: 'a'},
                json: true,
                headers: {'x-access-token': userToken}
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            organizationId = res.body.id
        })

        it('Token request fails with the wrong token', async () => {
            const fakeId = organizationId+Math.round(10*Math.random())
            const res = await promisifedRequest({
                url:'http://localhost:3000/member_tokens',
                method: 'POST',
                body: {organization_id: fakeId},
                json: true,
                headers: {'x-access-token': uuid.v4()}
            })

            expect(res.statusCode).to.equal(401)
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })

        it('Token request fails with fake organization_id', async () => {
            const fakeId = organizationId+Math.round(10*Math.random())
            const res = await promisifedRequest({
                url:'http://localhost:3000/member_tokens',
                method: 'POST',
                body: {organization_id: fakeId},
                json: true,
                headers: {'x-access-token': userToken}
            })

            expect(res.statusCode).to.equal(401)
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })

        it('Token request success', async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/member_tokens',
                method: 'POST',
                body: {organization_id: organizationId},
                json: true,
                headers: {'x-access-token': userToken}
            })

            expect(res.statusCode).to.equal(200)
            expect(res.body).to.be.an('string')
        })
    })
})