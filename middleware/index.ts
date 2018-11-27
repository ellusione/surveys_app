
import LoadResource from '../middleware/resource/load';
import GetResource from '../middleware/resource/get';
import SetAuth from '../middleware/auth/set';
import GetAuth from '../middleware/auth/get';
import VerifyAuthAccess from '../middleware/auth/verify_access';
import VerifyAuthCapability from '../middleware/auth/verify_capability';
import Factory from '../models/factory'
import GeneralMiddleware from './general'

export default class Middleware {

    loadResource: LoadResource
    getResource: GetResource

    setAuth: SetAuth
    getAuth: GetAuth
    verifyAuthAccess: VerifyAuthAccess
    VerifyAuthCapability: VerifyAuthCapability

    general: GeneralMiddleware
    
    constructor (modelsFactory: Factory) {
        this.loadResource = new LoadResource(modelsFactory)
        this.getResource = GetResource

        this.setAuth = new SetAuth(modelsFactory)
        this.getAuth = GetAuth
        this.verifyAuthAccess = new VerifyAuthAccess()
        this.VerifyAuthCapability = new VerifyAuthCapability(modelsFactory)

        this.general = GeneralMiddleware
    }
}