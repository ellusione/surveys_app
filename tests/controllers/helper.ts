import * as chai from 'chai'
chai.use(require('chai-as-promised'))
import request from 'request'
import bluebird from 'bluebird'
import {Role} from '../../roles'

const expect = chai.expect
const promisifedRequest = bluebird.Promise.promisify(request)

export type Instance = {id: number}

export async function createUser (name: string, username: string, password: string) {
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

export async function patchUser (name: string) {
    const res = await promisifedRequest({
        url:'http://localhost:3000/users',
        method: 'PATCH',
        body: {name},
        json: true
    })
    expect(res.statusCode).to.equal(200)
    expect(res.body).to.exist
    return res.body
}

export async function createUserToken(username: string, password: string) {
    const res = await promisifedRequest({
        url:'http://localhost:3000/user_tokens',
        method: 'POST',
        body: {username, password},
        json: true
    })

    expect(res.statusCode).to.equal(200)
    expect(res.body).to.be.an('string')
    return res.body
}

export async function createOrganization (userToken: string) {
    const res = await promisifedRequest({
        url:'http://localhost:3000/organizations',
        method: 'POST',
        body: {name: 'a'},
        json: true,
        headers: {'x-access-token': userToken}
    })
    expect(res.statusCode).to.equal(200)
    expect(res.body).to.exist
    return res.body
}

export async function createMemberToken (organizationId: number, userToken: string) {
    const res = await promisifedRequest({
        url:'http://localhost:3000/member_tokens',
        method: 'POST',
        body: {organization_id: organizationId},
        json: true,
        headers: {'x-access-token': userToken}
    })

    expect(res.statusCode).to.equal(200)
    expect(res.body).to.be.an('string')
    return res.body
}

export async function createSurvey (name: string, memberToken: string) {
    const res = await promisifedRequest({
        url:'http://localhost:3000/surveys',
        method: 'POST',
        body: {name},
        json: true,
        headers: {'x-access-token': memberToken}
    })
    expect(res.statusCode).to.equal(200)
    expect(res.body).to.exist
    return res.body
}

export async function createMember (userId: number, role: Role, memberToken: string) {
    const res = await promisifedRequest({
        url:'http://localhost:3000/surveys',
        method: 'POST',
        body: {user_id: userId, role: role.id },
        json: true,
        headers: {'x-access-token': memberToken}
    })
    expect(res.statusCode).to.equal(200)
    expect(res.body).to.exist
    return res.body
}