import { Controller, Post } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller('users')
export class UsersController {
    constructor(
        private readonly UsersService: UsersService,) {}

    @Post('seed')
    seed() {
        return this.UsersService.seedDatabase();
    }
}