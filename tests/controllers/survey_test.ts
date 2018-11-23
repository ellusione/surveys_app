import * as chai from 'chai'
chai.use(require('chai-as-promised'))
import request from 'request'
import {init} from '../../index'
const expect = chai.expect

describe('Survey test', () => {

    let user: any

    before('Init db and server with routes', async () => {
        await init()
    })

    beforeEach(async () => {   
       request({
            url:'http://localhost:3000/users',
            method: 'POST',
            body: {name: 'a'},
            json: true
        }, (err: Error | null, res: request.Response, body: any) => {
            expect(err).to.not.exist

            expect(res.statusCode).to.equal(200)

            expect(body).to.equal({
                name: 'a'
            })

            user = body
        })
    })

    it('User created', () => {
        expect(user).to.exist
    })
})