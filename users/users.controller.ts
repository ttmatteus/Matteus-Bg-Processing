import { Controller, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ProcessUsersJob } from "./process-users.job";

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly processUsersJob: ProcessUsersJob,
    ) {}

    @Post('seed')
    async seed() {
        const result = await this.usersService.seedDatabase();
        return result;
    }

    @Post('process')
    async process() {
        await this.processUsersJob.run();
        return { message: 'Processing job initiated' };
    }
}
