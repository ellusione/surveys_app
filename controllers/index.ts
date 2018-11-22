import initSurveysController from './surveys'
import Express from 'express';
import * as Models from '../models'

export default function initRoutes (app: Express.Express, modelsFactory: Models.ModelsFactory) {
    initSurveysController(app, modelsFactory)
}