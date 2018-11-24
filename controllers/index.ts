import Express from 'express';
import {initSurveysController} from './surveys'
import {initUsersController} from './users'
import {initMembersController} from './members'
import {initOrganizationsController} from './organizations'
import {initMemberSurveyPermissionController} from './member_survey_permissions'
import * as Models from '../models'

export function initRoutes (app: Express.Express, modelsFactory: Models.Factory) {
    initSurveysController(app, modelsFactory)
    initUsersController(app, modelsFactory)
    initMembersController(app, modelsFactory)
    initOrganizationsController(app, modelsFactory)
    initMemberSurveyPermissionController(app, modelsFactory)
}