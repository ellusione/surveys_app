import Express from 'express';
import Http from 'http';
import {initRoutes} from './controllers'
import {initDB} from './database'
import Factory from './models/factory'
import Middleware from './middleware/'

const port = process.env.PORT || 3000

export async function init(modelsFactory: Factory) {

    console.log("Done initializing database")

    const app = Express();

    const server = new Http.Server(app) 
    server.listen(port)

    console.log("Started server")

    const middleware = new Middleware(modelsFactory)

    app.use(Express.json())

    app.use(middleware.general.setRequiredProperties)

    app.use(middleware.setAuth.parseAuthHeader)

    initRoutes(app, modelsFactory, middleware)

    app.use(middleware.general.errorHandlingFn)

    console.log("Done initialzing routes")
}

if (require.main === module) {
    initDB().then((modelsFactory) => {
        init(modelsFactory)
    })
}


