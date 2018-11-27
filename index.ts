import Express from 'express';
import Http from 'http';
import {initRoutes} from './controllers'
import {initDB} from './database'
import Factory from './models/factory'
import * as Middleware from './middleware/'
import sequelize = require('sequelize');

const port = process.env.PORT || 3000

let models: Factory
let app: Express.Express
let server: Http.Server

export async function init(modelsFactory: Factory) {

    models = modelsFactory

    console.log("Done initializing database")

    app = Express();

    server = new Http.Server(app) 
    server.listen(port)

    console.log("Started server")

    const middleware = new Middleware.Middleware(modelsFactory)

    app.use(Express.json())

    app.use(Middleware.Base.setRequiredProperties)

    app.use(middleware.SetAuth.parseAuthHeader)

    initRoutes(app, modelsFactory, middleware)

    app.use(Middleware.Base.errorHandlingFn)

    console.log("Done initialzing routes")
}

export async function stop() {
    server.close()
    models.sequelize.close()
}

if (require.main === module) {
    initDB().then((modelsFactory) => {
        init(modelsFactory)
    })
}


