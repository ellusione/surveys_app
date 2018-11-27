import Express from 'express';
import Http from 'http';
import {initRoutes} from './controllers'
import {initDB} from './database'
import Factory from './models/factory'
import * as Middleware from './middleware/'

const port = process.env.PORT || 3000

export async function init(modelsFactory: Factory) {

    console.log("Done initializing database")

    const app = Express();

    const server = new Http.Server(app) 
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

if (require.main === module) {
    initDB().then((modelsFactory) => {
        init(modelsFactory)
    })
}


