import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigEnum } from '@/enum/config.enum';

import { QuestionController } from './question.controller';
import { Question } from './question.entity';
import { QuestionService } from './question.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question]),
    // ref: https://github.com/liaoliaots/nestjs-redis/blob/main/docs/latest/redis.md
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          url: `redis://:${configService.get(ConfigEnum.REDIS_PASSWORD)}@${configService.get(
            ConfigEnum.REDIS_HOST,
          )}:${configService.get(ConfigEnum.REDIS_PORT)}/${configService.get(ConfigEnum.REDIS_DB)}`,
          // host: configService.get(ConfigEnum.REDIS_HOST),
          // port: configService.get(ConfigEnum.REDIS_PORT),
          // password: configService.get(ConfigEnum.REDIS_PASSWORD),
        },
        isGlobal: false, // 不全局注册
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
