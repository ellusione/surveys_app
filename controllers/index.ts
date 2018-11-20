import initSurveysController from './surveys'
import Express from 'express';
import ModelsFactory from '../models'

export default function initRoutes (app: Express.Express, modelsFactory: ModelsFactory) {
    initSurveysController(app, modelsFactory)
}