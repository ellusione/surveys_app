import * as chai from 'chai'
chai.use(require('chai-as-promised'))
const expect = chai.expect
import request from 'request'
import bluebird from 'bluebird'
import {init} from '../../index'
import {initDB} from '../../database'
import * as Models from '../../models'

describe('Survey test', () => {
    type User = {id: number} //imperfect
    const promisifedRequest = bluebird.Promise.promisify(request)
    let modelsFactory: Models.Factory
    
    async function makeUser (name: string) {
        const res = await promisifedRequest({
            url:'http://localhost:3000/users',
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
        await modelsFactory.userModel.truncate()
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
            const user = await makeUser('a')

            expect(user.createdAt).to.exist
            expect(user.updatedAt).to.exist
            expect(user.deletedAt).to.not.exist
            expect(user.id).to.be.an('number')
            expect(user.name).to.equal('a')
        })
    })

    describe('Find user', () => {
        let user: User

        beforeEach(async () => {
            user = await makeUser('a')
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

    describe('Find users', () => {
        let users: User[]

        beforeEach(async () => {
            users = []
            users.push(await makeUser('a'))
            users.push(await makeUser('b'))
            users.push(await makeUser('c'))
        })

        it('Successfully find the users', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(3)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows).to.deep.equal(users)
        })

        it('Successfully find the users with pagination', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users?page=2&size=1`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(3)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows).to.deep.equal([users[1]])
        })

        it('Successfully find no users with pagination', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users?page=2&size=10`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.count).to.equal(3)
            expect(res.body.rows).to.be.an('array')
            expect(res.body.rows).to.be.empty
        })

        it('Error on finding users with incorrect pagination query', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users?page=a`,
                json: true
            })
            expect(res.statusCode).to.equal(400)
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })
    })

    describe('Patch user', () => {
        let user: User

        beforeEach(async () => {
            user = await makeUser('a')
        })

        it('Successfully update the user name', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.name).to.equal('grr')
        })

        it('Error on updating missing user', async () => {
            const fakeUserId = user.id+Math.round(10*Math.random())
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${fakeUserId}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true
            })
            expect(res.statusCode).to.equal(404)
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })

        it('Error on updating the user with invalid name', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
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
})