import ModelsFactory from './models'
import Express from 'express';
import Http from 'http';
import initRoutes from './controllers'
import {errorHandlingFn} from './helpers/middleware'

const port = process.env.PORT || 3000

const modelsFactory = new ModelsFactory()

const app = Express();

const server = new Http.Server(app) 
server.listen(port)

app.use(Express.json())

app.use(errorHandlingFn)

initRoutes(app, modelsFactory)


