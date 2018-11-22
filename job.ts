import {initDB} from './database'
import * as JobDefinition from './models/deletion_job/definition'
import Http from 'http';

const port = process.env.JOB_PORT || 3100

async function init() {
    const modelsFactory = await initDB()

    const server = new Http.Server()
    server.listen(port)

    async function process (job: JobDefinition.DeletionJobInstance) {
        const model = modelsFactory.sequelize.models[job.table_name]

        if (!model) {
            throw new Error(`no matching model found for ${job.table_name}`)
        }

        const whereCondition = JSON.parse(job.payload)
        
        await model.destroy({
            where: whereCondition
        })
    }

    async function processDeletionJob () {
        const job = await modelsFactory.deletionJobModel.findOne({
            // where: {
            //     error_count: {
            //         $lte: 11
            //     }
            // },
            order: [ [ 'createdAt', 'DESC' ]]
        })

        if (!job) {
            return;
        }

        console.log(`Processing ${job}`)

        try {
            await process(job)
        } catch (err) {
            console.log(err, job)

            let errorCount = job.error_count || 0

            job.update({error_count: ++errorCount})
        }
    }

    setInterval(processDeletionJob, 5000)
}

init()


