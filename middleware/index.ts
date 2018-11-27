
import LoadResource from '../middleware/resource/load';
import SetAuth from '../middleware/auth/set';
import VerifyAuthCapability from '../middleware/auth/verify_capability';
import Factory from '../models/factory'

export {GetResource} from '../middleware/resource/get';
export {GetAuth} from '../middleware/auth/get';
export {VerifyAuthAccess} from '../middleware/auth/verify_access'
export {Base} from '../middleware/base'

export class Middleware {

    LoadResource: LoadResource

    SetAuth: SetAuth
    VerifyAuthCapability: VerifyAuthCapability
    
    constructor (modelsFactory: Factory) {
        this.LoadResource = new LoadResource(modelsFactory)

        this.SetAuth = new SetAuth(modelsFactory)
        this.VerifyAuthCapability = new VerifyAuthCapability(modelsFactory)
    }
}