import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProcessTracking } from "./process-tracking.entity";
import { Repository } from "typeorm";


@Injectable()
export class ProcessTrackingService {
    constructor(
        @InjectRepository(ProcessTracking)
        private readonly processTrackingRepository: Repository<ProcessTracking>,
    ) {}

    async insertRecord(
        processName: string,
        sessionId: number,
        recordIds: number[],
    ): Promise<void> {
        const records = recordIds.map((recordId) => ({
            processName,
            sessionId,
            recordId,
        }));
        await this.processTrackingRepository.save(records);
    }

    async deleteRecords(processName: string, sessionId: number) {
        await this.processTrackingRepository.delete({
            processName,
            sessionId,
        });
    }
}