import Express from 'express';
import Http from 'http';
import {initRoutes} from './controllers'
import {initDB} from './database'
import Factory from './models/factory'
import ResourcesMiddleware from './middleware/resources'
import AuthMiddleware from './middleware/auth'
import * as Middleware from './middleware'

const port = process.env.PORT || 3000

export async function init(modelsFactory: Factory) {

    console.log("Done initializing database")

    const app = Express();

    const server = new Http.Server(app) 
    server.listen(port)

    console.log("Started server")

    const resourcesMiddleware = new ResourcesMiddleware(modelsFactory)
    const authMiddleware = new AuthMiddleware(modelsFactory)

    app.use(Express.json())

    app.use(authMiddleware.parseAuthHeader)

    initRoutes(app, modelsFactory, resourcesMiddleware, authMiddleware)

    app.use(Middleware.errorHandlingFn)

    console.log("Done initialzing routes")
}

if (require.main === module) {
    initDB().then((modelsFactory) => {
        init(modelsFactory)
    })
}


