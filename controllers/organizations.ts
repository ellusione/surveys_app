import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import Factory from '../models/factory'
import ResourcesMiddleware from '../middleware/resource/get';
import AuthMiddleware from '../middleware/auth/set';
import * as Middleware from '../middleware'
import { isNullOrUndefined } from 'util';
import {Capability, managerRole} from '../roles'

export function initOrganizationsController(
    app: Express.Express, 
    modelsFactory: Factory, 
    loadResource: LoadResource, 
    setAuth: SetAuth,
    verifyAuthAccess: VerifyAuthAccess,
    verifyAuthCapability: VerifyAuthCapability
) {
    
    app.post('/organizations', [
        Validator.body('name').isString(),
        authMiddleware.setAuthUser.bind(authMiddleware),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = Middleware.getAuthUser(req)

            const result = await modelsFactory.organizationModel.create({name: req.body.name})

            await modelsFactory.memberModel.create({
                user_id: <number> user.id,
                organization_id: <number> result.id,
                role_id: managerRole.id
            })

            return res.json(result)
        })().asCallback(next)
    })

    app.get('/organizations', [
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('size').optional().isInt({lt: 101, gt: 0}),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const page = isNullOrUndefined(req.query.page) ? 1 : req.query.page

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const result = await modelsFactory.organizationModel.findAndCountAll({
                offset: Middleware.calculatePaginationOffset(page, limit),
                limit
            })

            return res.json(result) 
        })().asCallback(next)
    })

    app.get('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        loadResource.loadOrganization.bind(loadResource),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        return res.json(Middleware.getOrganization(req))
    })

    app.patch('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        loadResource.loadOrganization.bind(loadResource),
        authMiddleware.setAuthMember.bind(authMiddleware),
        authMiddleware.verifyMemberAccessOfOrganization.bind(authMiddleware),
        authMiddleware.verifyAuthMemberCapability(Capability.Edit),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organization = Middleware.getOrganization(req)

            if (organization.name === req.body.name) {
                return res.json(organization) 
            }

            await organization.update({name: req.body.name})

            return res.json(organization) 
        })().asCallback(next)
    })

    app.delete('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        loadResource.loadOrganization.bind(loadResource),
        authMiddleware.setAuthMember.bind(authMiddleware),
        authMiddleware.verifyMemberAccessOfOrganization.bind(authMiddleware),
        authMiddleware.verifyAuthMemberCapability(Capability.Delete),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organization = Middleware.getOrganization(req)

            await organization.destroy()

            return res.sendStatus(200)
        })().asCallback(next)
    })
}