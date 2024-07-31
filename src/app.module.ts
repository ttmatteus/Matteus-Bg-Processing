import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from 'users/user.modules';
import { ProcessTrackingModule } from './process-tracking/process-tracking.entityts';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get('REDIS_URL'),
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: 100,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('POSTGRES_URL'),
        autoLoadEntities: true,
        synchronize: true, // N usar isso em produção, sempre deixar em false
        extra: {
          min: 10,
          max: 50,
          idleTimeoutMillis: 3000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    ProcessTrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
