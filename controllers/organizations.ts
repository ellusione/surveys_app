import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import Factory from '../models/factory'
import * as ModelTypes from '../models'
import ResourcesMiddleware from '../middleware/resources';
import AuthMiddleware from '../middleware/auth';
import * as Middleware from '../middleware'
import { isNullOrUndefined } from 'util';
import {Capability, adminRole} from '../roles'
import * as Errors from '../errors'

export function initOrganizationsController(
    app: Express.Express, 
    modelsFactory: Factory, 
    resourcesMiddleware: ResourcesMiddleware, 
    authMiddleware: AuthMiddleware
) {
    function checkMemberAuth (capability: Capability) {
        return (req: Express.Request, res: Express.Response, next: Function) => {

            return (async (): Bluebird<void> => {
                switch (req.auth.type) {
                    case 'member': {
                        const member = await authMiddleware.getAndCheckMemberAuth(req.auth, capability)

                        if (member.organization_id !== res.locals.organization.id) {
                            throw new Errors.UnauthorizedError()
                        }
                        res.locals.auth_member = member
                        return
                    }

                    default: throw new Errors.UnauthorizedError()
                }
            })().asCallback(next)
        }
    }
    
    app.post('/organizations', [
        Validator.body('name').isString(),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            if (req.auth.type !== 'user') {
                throw new Errors.UnauthorizedError()
            }

            const result = await modelsFactory.organizationModel.create({name: req.body.name})

            await modelsFactory.memberModel.create({
                user_id: req.auth.id,
                organization_id: <number> result.id,
                role_id: adminRole.id
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
            const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

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
        resourcesMiddleware.loadOrganization,
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        return res.json(res.locals.organization)
    })

    app.patch('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        Validator.body('name').isString(),
        resourcesMiddleware.loadOrganization,
        checkMemberAuth(Capability.Edit),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organization = <ModelTypes.OrganizationInstance> res.locals.organization

            if (organization.name === req.body.name) {
                return res.json(organization) 
            }

            await organization.update({name: req.body.name})

            return res.json(organization) 
        })().asCallback(next)
    })

    app.delete('/organizations/:organization_id', [
        Validator.param('organization_id').isInt({gt: 0}),
        checkMemberAuth(Capability.Delete),
        Middleware.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organization = <ModelTypes.OrganizationInstance> res.locals.organization

            await organization.destroy()

            return res.sendStatus(200)
        })().asCallback(next)
    })
}