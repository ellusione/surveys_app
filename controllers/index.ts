import Express from 'express';
import {initSurveysController} from './surveys'
import {initUsersController} from './users'
import {initMembersController} from './members'
import {initOrganizationsController} from './organizations'
import {initMemberSurveyPermissionController} from './member_survey_permissions'
import Factory from '../models/factory'
import { initTokensController } from './tokens';
import ResourcesMiddleware from '../middleware/resources';
import AuthMiddleware from '../middleware/auth';

export function initRoutes (app: Express.Express, modelsFactory: Factory, resourcesMiddleware: ResourcesMiddleware, authMiddleware: AuthMiddleware) {
    initTokensController(app, modelsFactory, resourcesMiddleware, authMiddleware)
    initSurveysController(app, modelsFactory, resourcesMiddleware, authMiddleware)
    initUsersController(app, modelsFactory, resourcesMiddleware, authMiddleware)
    initMembersController(app, modelsFactory, resourcesMiddleware, authMiddleware)
    initOrganizationsController(app, modelsFactory, resourcesMiddleware, authMiddleware)
    initMemberSurveyPermissionController(app, modelsFactory, resourcesMiddleware, authMiddleware)
}