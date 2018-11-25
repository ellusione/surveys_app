import * as chai from 'chai'
chai.use(require('chai-as-promised'))
import request from 'request'
import bluebird from 'bluebird'
import {init} from '../../index'
import {initDB} from '../../database'
import Factory from '../../models/factory'

const expect = chai.expect

describe('Token test', () => {
    const promisifedRequest = bluebird.Promise.promisify(request)
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

    describe('Create token', () => {
        const username = 'b'
        const password = 'c'

        beforeEach(async () => {
            await makeUser('a',username, password)
        })

        it('Token request fails with improper credentials', async () => {
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
})