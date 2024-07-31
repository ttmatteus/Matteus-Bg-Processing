import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async seedDatabase(totalSize = 500_000, batchSize = 1000): Promise<{ message: string, count: number }> {
        let count = 0;

        for (const batch of this.generateUsers(totalSize, batchSize, count)) {
            await this.userRepository.save(batch);
            count += batch.length;
            console.log(`Inserted ${count} users`);
        }
        console.log('Database seeding completed');

        return { message: 'Database seeding completed', count };
    }

    private *generateUsers(totalSize: number, batchSize: number, initialCount: number) {
        let count = initialCount;
        while (count < totalSize) {
            const batch = [];
            for (let i = 0; i < batchSize && count < totalSize; i++, count++) {
                const user = this.userRepository.create({ status: 'pending' });
                batch.push(user);
            }
            yield batch;
        }
    }
}
