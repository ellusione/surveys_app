import * as chai from 'chai'
chai.use(require('chai-as-promised'))
import request from 'request'
import bluebird from 'bluebird'

const expect = chai.expect
const promisifedRequest = bluebird.Promise.promisify(request)

type Instance = {id: number}

export async function makeUser (name: string, username: string, password: string) {
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

export async function patchUser (name: string): Promise<Instance> {
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

export async function makeUserToken(username: string, password: string): Promise<string> {
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

export async function createOrganization (userToken: string): Promise<Instance> {
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

export async function createMemberToken (organization: Instance, userToken: string): Promise<string> {
    const res = await promisifedRequest({
        url:'http://localhost:3000/member_tokens',
        method: 'POST',
        body: {organization_id: organization.id},
        json: true,
        headers: {'x-access-token': userToken}
    })

    expect(res.statusCode).to.equal(200)
    expect(res.body).to.be.an('string')
    return res.body
}