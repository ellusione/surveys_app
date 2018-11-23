import * as chai from 'chai'
chai.use(require('chai-as-promised'))
const expect = chai.expect
import request from 'request'
import * as bluebird from 'bluebird'
import {init} from '../../index'

describe('Survey test', () => {
    const promisifedRequest = bluebird.Promise.promisify(request)
    
    before('Init db and server with routes', async () => {
        await init()
    })

    describe('Create user', () => {
        it('User creation errors with insufficient req body', async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/users',
                method: 'POST',
                body: {'name_false': 'a'},
                json: true
            })

            expect(res.statusCode).to.equal(400)
            
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })

        it('User created with proper req body', async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/users',
                method: 'POST',
                body: {'name': 'a'},
                json: true
            })

            expect(res.statusCode).to.equal(200)

            expect(res.body).to.exist
            expect(res.body.createdAt).to.exist
            expect(res.body.updatedAt).to.exist
            expect(res.body.deletedAt).to.not.exist
            expect(res.body.id).to.be.an('number')
            expect(res.body.name).to.equal('a')
        })
    })

    describe('Find user', () => {
        type User = {id: number} //imperfect
        let user: User

        beforeEach(async () => {
            const res = await promisifedRequest({
                url:'http://localhost:3000/users',
                method: 'POST',
                body: {'name': 'a'},
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.id).to.be.an('number')
            user = res.body
        })

        it('Successfully find the user', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body).to.deep.equal(user)
        })

        it('Fail to find missing user', async () => {
            const fakeUserId = user.id+Math.round(10*Math.random())
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${fakeUserId}`,
                json: true
            })
            expect(res.statusCode).to.equal(404)
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })
    })
})