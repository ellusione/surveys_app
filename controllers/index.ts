import Express from 'express';
import {initSurveysController} from './surveys'
import {initUsersController} from './users'
import {initMembersController} from './members'
import {initOrganizationsController} from './organizations'
import {initMemberSurveyPermissionController} from './member_survey_permissions'
import Factory from '../models/factory'

export function initRoutes (app: Express.Express, modelsFactory: Factory) {
    initSurveysController(app, modelsFactory)
    initUsersController(app, modelsFactory)
    initMembersController(app, modelsFactory)
    initOrganizationsController(app, modelsFactory)
    initMemberSurveyPermissionController(app, modelsFactory)
}