import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import Factory from '../models/factory'
import * as Middleware from '../middleware';
import { isNullOrUndefined } from 'util';
import {Capability, managerRole} from '../roles'

export function initOrganizationsController(
    app: Express.Express, 
    modelsFactory: Factory, 
    middleware: Middleware.Middleware
) {
    
    app.post('/organizations', [
        Validator.body('name').isString(),
        middleware.setAuth.setAuthUser.bind(middleware.setAuth),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = Middleware.GetAuth.getAuthUser(req)

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
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const page = isNullOrUndefined(req.query.page) ? 1 : req.query.page

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const result = await modelsFactory.organizationModel.findAndCountAll({
                offset: Middleware.Base.calculatePaginationOffset(page, limit),
                limit
            })

            return res.json(result) 
        })().asCallback(next)
    })

    app.get('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        middleware.loadResource.loadOrganization.bind(middleware.loadResource),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        return res.json(Middleware.GetResource.getOrganization(req))
    })

    app.patch('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        middleware.loadResource.loadOrganization.bind(middleware.loadResource),
        middleware.setAuth.setAuthMember.bind(middleware.setAuth),
        middleware.verifyAuthAccess.verifyMemberAccessOfOrganization.bind(middleware.verifyAuthAccess),
        middleware.VerifyAuthCapability.verifyAuthMemberCapability(Capability.Edit).bind(middleware.VerifyAuthCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organization = Middleware.GetResource.getOrganization(req)

            if (organization.name === req.body.name) {
                return res.json(organization) 
            }

            await organization.update({name: req.body.name})

            return res.json(organization) 
        })().asCallback(next)
    })

    app.delete('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        middleware.loadResource.loadOrganization.bind(middleware.loadResource),
        middleware.setAuth.setAuthMember.bind(middleware.setAuth),
        middleware.verifyAuthAccess.verifyMemberAccessOfOrganization.bind(middleware.verifyAuthAccess),
        middleware.VerifyAuthCapability.verifyAuthMemberCapability(Capability.Delete).bind(middleware.verifyAuthAccess),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organization = Middleware.GetResource.getOrganization(req)

            await organization.destroy()

            return res.sendStatus(200)
        })().asCallback(next)
    })
}