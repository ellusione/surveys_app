import {initDB} from './database'
import Express from 'express';
import Http from 'http';
import {initRoutes} from './controllers'
import {errorHandlingFn} from './helpers/middleware'

const port = process.env.PORT || 3000

export async function init() {
    const modelsFactory = await initDB()

    const app = Express();

    const server = new Http.Server(app) 
    server.listen(port)

    app.use(Express.json())

    app.use(errorHandlingFn)

    initRoutes(app, modelsFactory)
}

if (require.main === module) {
    init()
}


