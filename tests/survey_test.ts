import ModelsFactory from '../models'
import {getInstanceId} from '../models/helpers'
import {initDB} from '../database'
import * as User from '../models/user'
import * as Organization from '../models/organization'
import * as Member from '../models/member'
import * as Roles from '../roles'
import { expect } from 'chai';

describe('Survey test', () => {
    let modelsFactory: ModelsFactory
    let user: User.Instance
    let organization: Organization.Instance
    let member: Member.Instance

    before('Init db', async () => {
        modelsFactory = await initDB()
        user = await modelsFactory.userModel.create({name: 'user a'})
        organization = await modelsFactory.organizationModel.create({name: 'org b'})
        
        member = await modelsFactory.memberModel.create({
            user_id: getInstanceId(user), 
            organization_id: getInstanceId(organization), 
            role_id: Roles.memberRole.id
        })
    })

    it('Should save survey', async () => {
        const result = await modelsFactory.surveyModel.create({
            name: 'a', creator_id: getInstanceId(user), organization_id: getInstanceId(organization)
        })
        expect(result.creator_id).to.exist
        expect(result.creator_id).to.equal(user.id)

        expect(result.name).to.equal('a')

        expect(result.organization_id).to.exist
        expect(result.organization_id).to.equal(organization.id)

        expect(result.id).to.exist
    })

})