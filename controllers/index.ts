import Express from 'express';
import {initSurveysController} from './surveys'
import {initUsersController} from './users'
import {initMembersController} from './members'
import {initOrganizationsController} from './organizations'
import {initMemberSurveyPermissionController} from './member_survey_permissions'
import * as Factory from '../models/factory'
import { initTokensController } from './tokens';
import * as Middleware from '../middleware';

export function initRoutes (app: Express.Express, modelsFactory: Factory.Models, middleware: Middleware.Middleware) {
    initTokensController(app, modelsFactory, middleware)
    initSurveysController(app, modelsFactory, middleware)
    initUsersController(app, modelsFactory, middleware)
    initMembersController(app, modelsFactory, middleware)
    initOrganizationsController(app, modelsFactory, middleware)
    initMemberSurveyPermissionController(app, modelsFactory, middleware)
}