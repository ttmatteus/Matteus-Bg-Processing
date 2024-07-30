import { InjectQueue, Process, Processor } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Queue } from 'bull'; 
import { DataSource } from "typeorm";
import { User } from "./user.entity";

const QUEUE_NAME = 'cron-jobs';
const JOB_NAME = 'process-users';

const BATCH_SIZE = 1000;
const BATCH_DELAY = 1000;
const SLICE_SIZE = 100;

type UserRecord = {
    id: number;
    status: 'pending' | 'processed';
};

@Injectable()
@Processor(QUEUE_NAME)
export class ProcessUsersJob {
    constructor(
        private readonly dataSource: DataSource,
        @InjectQueue(QUEUE_NAME)
        private readonly queue: Queue,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_3PM)
    async run() {
        // Adiciona um job na fila
        // Buscar x registros
        // Processar
        // Agendar a próxima execução
        await this.queue.add(JOB_NAME);
    }

    @Process(JOB_NAME)
    async process() {
        // Logic para processar o job
        const batch = await this.queryBatach();
        await this.processBatch(batch);

        if (batch.length === BATCH_SIZE) {
            await this.queue.add(JOB_NAME), { delay: BATCH_DELAY };
        }
    }
    
    private async queryBatach() {
        return this.dataSource.query<UserRecord[]>(
            `select id, status from users where status = 'peding' limit ${BATCH_SIZE} for update skip locked`
        );
    }

    private async processBatch(batch: UserRecord[]) {
        for (let i = 0; i < batch.length; i += SLICE_SIZE) {
            const slice = batch.slice(i, i + SLICE_SIZE)
            const results = await Promise.allSettled(
                slice.map((record) => this.processRecord(record))
            );
        }
    }

    private async processRecord(record: UserRecord) {
        await new Promise ((resolve) => 
            setTimeout(resolve, Math.random() * (500 - 200) + 200),
        );
        if (Math.random() < 0.1) {
            throw new Error('Random error');
        }
        await this.dataSource.manager.update(User, record.id, {
            status: 'processed',
        });
    }
}
