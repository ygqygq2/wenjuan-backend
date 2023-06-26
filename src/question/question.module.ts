import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigEnum } from '@/enum/config.enum';

import { QuestionController } from './question.controller';
import { Question } from './question.entity';
import { QuestionService } from './question.service';
import { QuestionCheckbox } from './questionCheckbox.entity';
import { QuestionCheckboxOption } from './questionCheckboxOption.entity';
import { Component } from './questionComponent.entity';
import { QuestionInfo } from './questionInfo.entity';
import { QuestionInput } from './questionInput.entity';
import { QuestionParagraph } from './questionParagraph.entity';
import { QuestionRadio } from './questionRadio.entity';
import { QuestionRadioOption } from './questionRadioOption.entity';
import { QuestionTextarea } from './questionTextarea.entity';
import { QuestionTitle } from './questionTitle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      Component,
      QuestionCheckbox,
      QuestionCheckboxOption,
      QuestionInfo,
      QuestionInput,
      QuestionParagraph,
      QuestionRadio,
      QuestionRadioOption,
      QuestionTextarea,
      QuestionTitle,
    ]),
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
