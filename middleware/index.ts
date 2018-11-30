
import ResourceLoader from '../middleware/resource/load';
import AuthSetter from '../middleware/auth/set';
import AuthCapability from './auth/capability';
import * as Factory from '../models/factory'

export {Resource} from '../middleware/resource/get';
export {Auth} from '../middleware/auth/get';
export {AuthAccess} from './auth/access'
export {Base} from '../middleware/base'

export class Middleware {

    resourceLoader: ResourceLoader
    authSetter: AuthSetter
    authCapability: AuthCapability
    
    constructor (modelsFactory: Factory.Models) {
        this.resourceLoader = new ResourceLoader(modelsFactory)

        this.authSetter = new AuthSetter(modelsFactory)
        this.authCapability = new AuthCapability(modelsFactory)
    }
}