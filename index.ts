import Express from 'express';
import Http from 'http';
import {initRoutes} from './controllers'
import {initDB} from './database'
import * as Factory from './models/factory'
import * as Middleware from './middleware/'

const port = process.env.PORT || 3000

let initialized = false

export async function init(modelsFactory: Factory.Models) {

    if (initialized) {
        return
    }

    console.log("Done initializing database")

    const app = Express();

    const server = new Http.Server(app) 
    server.listen(port)

    initialized = true
    console.log("Started server")

    const middleware = new Middleware.Middleware(modelsFactory)

    app.use(Express.json())

    app.use(Middleware.Base.setRequiredProperties)

    app.use(middleware.authSetter.parseHeader)

    initRoutes(app, modelsFactory, middleware)

    app.use(Middleware.Base.errorHandlingFn)

    console.log("Done initialzing routes")

    process.on('exit', () => {
        server.close()
        modelsFactory.sequelize.close()
        initialized = false
    })
}

if (require.main === module) {
    initDB().then((modelsFactory) => {
        init(modelsFactory)
    })
}


