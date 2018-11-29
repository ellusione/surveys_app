import * as chai from 'chai'
chai.use(require('chai-as-promised'))
import request from 'request'
import bluebird from 'bluebird'
import {init} from '../../index'
import {initDB} from '../../database'
import Factory from '../../models/factory'
import * as Helper from './helper'

const expect = chai.expect

describe('User test', () => {
    const promisifedRequest = bluebird.Promise.promisify(request)
    const username = 'bq23'
    const password = 'cddsw'  
    const email = 'c'
    let modelsFactory: Factory

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
                body: {'name_false': 'a', username, password, email},
                json: true
            })

            expect(res.statusCode).to.equal(400)
            
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })

        it('User created with proper req body', async () => {
            const user = await Helper.createUser('a', username, password, email)

            expect(user.created_at).to.exist
            expect(user.updated_at).to.exist
            expect(user.deleted_at).to.not.exist
            expect(user.id).to.be.an('number')
            expect(user.name).to.equal('a')
        })
    })

    describe('Find user', () => {
        let user: Helper.Instance

        beforeEach(async () => {
            user = await Helper.createUser('a', username, password, email)
        })

        it('Successfully find the user', async () => {
            const res = await promisifedRequest({
                url: `http://localhost:3000/users/${user.id}`,
                json: true
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body).to.deep.equal(user)
        })

        it('Fail to find missing user', async () => {
            const fakeUserId = user.id+Math.round(1000*Math.random())
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
        let users: Helper.Instance[]

        beforeEach(async () => {
            users = []
            users.push(await Helper.createUser('a', username, password, email+'a'))
            users.push(await Helper.createUser('b', username+'b', password, email+'b'))
            users.push(await Helper.createUser('c', username+'c', password, email+'c'))
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
        let user: Helper.Instance
        let userToken: string

        beforeEach(async () => {
            user = await Helper.createUser('a', username, password, email)
        })

        beforeEach(async () => {
            userToken = await Helper.createUserToken(username, password)
        })

        it('Successfully update the user name', async () => {
            const userToken = await Helper.createUserToken(username, password)
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true,
                headers: {'x-access-token': userToken}
            })
            expect(res.statusCode).to.equal(200)
            expect(res.body).to.exist
            expect(res.body.name).to.equal('grr')

            const foundUserRes = await promisifedRequest({
                url: `http://localhost:3000/users/${user.id}`,
                json: true
            })
            expect(foundUserRes.statusCode).to.equal(200)
            expect(foundUserRes.body).to.exist
            expect(foundUserRes.body.name).to.equal('grr')
        })

        it('Error when missing the token', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true
            })
            expect(res.statusCode).to.equal(401)
        })

        it('Error when the token belongs to the wrong user', async () => {
            await Helper.createUser('c', username+'c', password, email+'c')
            const otherUserToken = await Helper.createUserToken(username+'c', password)

            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true,
                headers: {'x-access-token': otherUserToken}
            })
            expect(res.statusCode).to.equal(401)
        })

        it('Error on updating missing user', async () => {
            const fakeUserId = user.id+Math.round(1000*Math.random())
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${fakeUserId}`,
                method: 'PATCH',
                body: {name: 'grr'},
                json: true,
                headers: {'x-access-token': userToken}
            })
            expect(res.statusCode).to.equal(404)
        })

        it('Error on updating the user with invalid name', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
                method: 'PATCH',
                body: {name: null},
                json: true,
                headers: {'x-access-token': userToken}
            })
            expect(res.statusCode).to.equal(400)
            expect(res.body).to.exist
            expect(res.body.errors).to.be.an('array')
            expect(res.body.errors.length).to.equal(1)
        })
    })

    describe('Delete user', () => {
        let user: Helper.Instance
        let userToken: string

        beforeEach(async () => {
            user = await Helper.createUser('a', username, password, email)
        })

        beforeEach(async () => {
            userToken = await Helper.createUserToken(username, password)
        })

        it('Successfully delete the user', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
                method: 'DELETE',
                headers: {'x-access-token': userToken}
            })
            expect(res.statusCode).to.equal(200)

            const foundUserRes = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`
            })

            expect(foundUserRes.statusCode).to.equal(404)
        })

        it('Error when missing the token', async () => {
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
                method: 'DELETE'
            })
            expect(res.statusCode).to.equal(401)
        })

        it('Error when the token belongs to the wrong user', async () => {
            await Helper.createUser('c', username+'c', password, email+'c')
            const otherUserToken = await Helper.createUserToken(username+'c', password)

            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${user.id}`,
                method: 'DELETE',
                headers: {'x-access-token': otherUserToken}
            })
            expect(res.statusCode).to.equal(401)
        })

        it('Fail to delete missing user', async () => {
            const fakeUserId = user.id+Math.round(1000*Math.random())
            const res = await promisifedRequest({
                url:`http://localhost:3000/users/${fakeUserId}`,
                method: 'DELETE',
                headers: {'x-access-token': userToken}
            })
            expect(res.statusCode).to.equal(404)
        })
    })
})