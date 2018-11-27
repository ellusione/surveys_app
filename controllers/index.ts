import Express from 'express';
import {initSurveysController} from './surveys'
import {initUsersController} from './users'
import {initMembersController} from './members'
import {initOrganizationsController} from './organizations'
import {initMemberSurveyPermissionController} from './member_survey_permissions'
import Factory from '../models/factory'
import { initTokensController } from './tokens';
import ResourcesMiddleware from '../middleware/resource/get';
import AuthMiddleware from '../middleware/auth/set';

export function initRoutes (app: Express.Express, modelsFactory: Factory, loadResource: ResourcesMiddleware, authMiddleware: AuthMiddleware) {
    initTokensController(app, modelsFactory, loadResource, authMiddleware)
    initSurveysController(app, modelsFactory, loadResource, authMiddleware)
    initUsersController(app, modelsFactory, loadResource, authMiddleware)
    initMembersController(app, modelsFactory, loadResource, authMiddleware)
    initOrganizationsController(app, modelsFactory, loadResource, authMiddleware)
    initMemberSurveyPermissionController(app, modelsFactory, loadResource, authMiddleware)
}