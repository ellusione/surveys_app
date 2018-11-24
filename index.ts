import Express from 'express';
import Http from 'http';
import {initRoutes} from './controllers'
import {errorHandlingFn} from './helpers/middleware'
import {initDB} from './database'
import * as Models from './models'

const port = process.env.PORT || 3000

export async function init(modelsFactory: Models.Factory) {

    console.log("Done initializing database")

    const app = Express();

    const server = new Http.Server(app) 
    server.listen(port)

    console.log("Started server")

    app.use(Express.json())

    initRoutes(app, modelsFactory)

    app.use(errorHandlingFn)

    console.log("Done initialzing routes")
}

if (require.main === module) {
    initDB().then((modelsFactory) => {
        init(modelsFactory)
    })
}


