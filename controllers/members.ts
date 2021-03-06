import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import * as Factory from '../models/factory'
import * as ModelTypes from '../models'
import * as Middleware from '../middleware';
import { isNullOrUndefined } from 'util';
import {Role, Capability} from '../roles'
import * as Errors from '../errors'

export function initMembersController(
    app: Express.Express, 
    modelsFactory: Factory.Models,
    middleware: Middleware.Middleware
) {

    app.post('/members', [
        Validator.body('user_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        middleware.authSetter.setMember.bind(middleware.authSetter),
        middleware.authCapability.verifyMember(Capability.Create).bind(middleware.authCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organizationId = Middleware.Auth.getMember(req).organization_id

            const userId = req.body.user_id

            const user = await modelsFactory.userModel.findById(userId)

            if (!user) {
                throw new Errors.NotFoundError(ModelTypes.userName, userId)
            }

            const result = await modelsFactory.memberModel.create({
                user_id: req.body.user_id, 
                organization_id: organizationId,
                role_id: req.body.role_id
            })

            return res.json(result)
        })().asCallback(next)
    })
        
    app.get('/members', [ 
        Validator.query('page').optional().isInt({gt: -1}), 
        Validator.query('size').optional().isInt({lt: 101, gt: 0}),
        Validator.query('user_id').optional().isInt({gt: 0}),
        Validator.query('organization_id').optional().isInt({gt: 0}),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const userId = req.query.user_id

            const organizationId = req.query.organization_id

            if (userId && organizationId) { //move to validation chain?
                throw new Errors.BadRequestError('cannot include both user_id and organization_id in query')
            }

            const whereCondition = userId ? {user_id: userId} : (organizationId ? {organization_id: organizationId} : null)

            const page = isNullOrUndefined(req.query.page) ? 1 : req.query.page

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const offset = Middleware.Base.calculatePaginationOffset(page, limit)

            const result = await modelsFactory.memberModel.findAndCountAll(
                whereCondition ? {
                    where: whereCondition,
                    offset,
                    limit
                } : {
                offset,
                limit
            })

            return res.json(result) 
        })().asCallback(next)
    })

    app.get('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        middleware.resourceLoader.loadMember.bind(middleware.resourceLoader),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {

        let member: ModelTypes.MemberInstance
        try {
            member = Middleware.Resource.getMember(req)
        } catch (err) {
            return next(err)
        }
        return res.json(member)
    })

    app.patch('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        middleware.resourceLoader.loadMember.bind(middleware.resourceLoader),
        middleware.authSetter.setMember.bind(middleware.authSetter),
        Middleware.AuthAccess.verifyAccessOfMember,
        middleware.authCapability.verifyMember(Capability.Edit).bind(middleware.authCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const member = Middleware.Resource.getMember(req)

            if (member.role_id === req.body.role_id) {
                return res.json(member)
            }

            await member.update({role_id: req.body.role_id})

            return res.json(member)
        })().asCallback(next)
    })

    app.delete('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        middleware.resourceLoader.loadMember.bind(middleware.resourceLoader),
        middleware.authSetter.setMember.bind(middleware.authSetter),
        Middleware.AuthAccess.verifyAccessOfMember,
        middleware.authCapability.verifyMember(Capability.Delete).bind(middleware.authCapability),
        Middleware.Base.validationErrorHandlingFn  
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const member = Middleware.Resource.getMember(req)

            await member.destroy()

            return res.sendStatus(200)
        })().asCallback(next)
    })
}