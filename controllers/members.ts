import Express from 'express';
import Validator from 'express-validator/check'
import Bluebird from 'bluebird'
import Factory from '../models/factory'
import * as ModelTypes from '../models'
import * as Middleware from '../helpers/middleware'
import makeAuthMiddleware from '../helpers/auth_middleware'
import { isNullOrUndefined } from 'util';
import {Role, Capability} from '../roles'
import * as Errors from '../helpers/errors'

type PaginationResult = {rows: ModelTypes.MemberInstance[], count: number}

export function initMembersController(app: Express.Express, modelsFactory: Factory) {
    const authMiddleware = makeAuthMiddleware(modelsFactory)
    
    function checkAuth (capability: Capability) {
        return (req: Express.Request, res: Express.Response, next: Function) => {

            return (async (): Bluebird<void> => {
                switch (req.auth.type) {
                    case 'member': {
                        res.locals.auth_member = await authMiddleware.getAndCheckMemberAuth(req.auth, capability)
                        return
                    }

                    default: throw new Errors.UnauthorizedError()
                }
            })().asCallback(next)
        }
    }

    app.post('/members', [
        Validator.body('user_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        checkAuth(Capability.Create),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const organizationId = (<ModelTypes.MemberInstance> res.locals.auth_member).organization_id

            const userId = req.body.user_id

            const user = await modelsFactory.userModel.findById(userId)

            if (!user) {
                throw new Errors.NotFoundError(ModelTypes.userName, userId)
            }

            const organization = await modelsFactory.organizationModel.findById(organizationId)

            if (!organization) {
                throw new Errors.NotFoundError('Organization not found')
            }

            const result = await modelsFactory.memberModel.create({
                user_id: req.body.user_id, 
                organization_id: req.body.organization_id,
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
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            let result: PaginationResult

            const userId = req.query.user_id

            const organizationId = req.query.organization_id

            if (userId && organizationId) { //move to validation chain?
                throw new Errors.BadRequestError('cannot include both user_id and organization_id in query')
            }

            const whereCondition = userId ? {user_id: userId} : (organizationId ? {organization_id: organizationId} : null)

            const page = isNullOrUndefined(req.query.page) ? 0 : req.query.page

            const limit = isNullOrUndefined(req.query.size) ? 10 : req.query.size

            const offset = Middleware.calculatePaginationOffset(page, limit)

            result = await modelsFactory.memberModel.findAndCountAll(
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
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const memberId = req.params.member_id
            const result = await modelsFactory.memberModel.findById(memberId)

            if (result) {
                res.json(result) 
            }
            throw new Errors.NotFoundError(ModelTypes.memberName, memberId)
        })().asCallback(next)
    })

    app.patch('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        Validator.body('role_id').isInt({gt: 0, lt: Role.allRoles.size+1}),
        checkAuth(Capability.Edit),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const memberId = req.params.member_id
            const result = await modelsFactory.memberModel.findById(memberId)

            if (!result) {
                throw new Errors.NotFoundError(ModelTypes.memberName, memberId)
            }

            if (result.role_id === req.body.role_id) {
                return res.json(result)
            }

            await result.update({role_id: req.body.role_id})

            return res.json(result)
        })().asCallback(next)
    })

    app.delete('/members/:member_id', [
        Validator.param('member_id').isInt({gt: 0}),
        checkAuth(Capability.Delete),
        Middleware.validationErrorHandlingFn
    ],
    (req: Express.Request, res: Express.Response, next: Function) => {
        
        return (async (): Bluebird<Express.Response> => {
            const memberId = req.params.member_id
            const result = await modelsFactory.memberModel.destroy({
                where: {
                    id: memberId
                }
            })

            if (result === 1) {
                return res.status(200)
            }

            throw new Errors.NotFoundError(ModelTypes.memberName, memberId)
        })().asCallback(next)
    })
}