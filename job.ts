import {initDB} from './database'
import * as JobDefinition from './models/deletion_job/definition'
import Factory from './models/factory'

export function getDeletionRunnerFn(modelsFactory: Factory) {
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

    async function processDeletionJob (): Promise<void> {
        const job = await modelsFactory.deletionJobModel.findOne({
            where: {
                error_count: { //does this where clause work?
                    $lte: 11
                }
            },
            order: [ [ 'created_at', 'DESC' ]]
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

    return processDeletionJob
}

if (require.main === module) {
    initDB().then((modelsFactory) => {

        const fn = getDeletionRunnerFn(modelsFactory)

        setInterval(fn, 5000)
    })
}


