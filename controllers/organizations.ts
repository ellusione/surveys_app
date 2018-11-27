import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import Factory from '../models/factory'
import * as ModelTypes from '../models'
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
        middleware.authSetter.setUser.bind(middleware.authSetter), //todo: only certain kinds of users can make organizations
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const user = Middleware.Auth.getUser(req)

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
        middleware.resourceLoader.loadOrganization.bind(middleware.resourceLoader),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        let organization: ModelTypes.OrganizationInstance
        try {
            organization = Middleware.Resource.getOrganization(req)
        } catch (err) {
            return next(err)
        }
        return res.json(organization)
    })

    app.patch('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        middleware.resourceLoader.loadOrganization.bind(middleware.resourceLoader),
        middleware.authSetter.setMember.bind(middleware.authSetter),
        Middleware.AuthAccess.verifyMemberAccessOfOrganization,
        middleware.authCapability.verifyMember(Capability.Edit).bind(middleware.authCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organization = Middleware.Resource.getOrganization(req)

            if (organization.name === req.body.name) {
                return res.json(organization) 
            }

            await organization.update({name: req.body.name})

            return res.json(organization) 
        })().asCallback(next)
    })

    app.delete('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        middleware.resourceLoader.loadOrganization.bind(middleware.resourceLoader),
        middleware.authSetter.setMember.bind(middleware.authSetter),
        Middleware.AuthAccess.verifyMemberAccessOfOrganization,
        middleware.authCapability.verifyMember(Capability.Delete).bind(middleware.authCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organization = Middleware.Resource.getOrganization(req)

            await organization.destroy()

            return res.sendStatus(200)
        })().asCallback(next)
    })
}