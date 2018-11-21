import ModelsFactory from '../models'
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
        modelsFactory = new ModelsFactory()
        user = await modelsFactory.userModel.create({name: 'user a'})
        organization = await modelsFactory.organizationModel.create({name: 'org b'})

        if (!user.id || !organization.id) { //fixme
            throw new Error('no id')
        }
        
        member = await modelsFactory.memberModel.create({
            user_id: user.id, 
            organization_id: organization.id, 
            role_id: Roles.memberRole.id
        })
    })

  it('should return hello world', async () => {
    if (!user.id || !organization.id) {
        throw new Error('no id')
    }
    const result = await modelsFactory.surveyModel.create({
        name: 'a', creator_id: user.id, organization_id: organization.id
    })
    expect(result).to.equal('Hello World!');
  })

})