import * as fs from 'fs';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

import { DataSource, DataSourceOptions } from 'typeorm';

import { ConfigEnum } from '@/enum/config.enum';

// 通过环境变量读取不同的 .env 文件
export function getEnv(env: string): Record<string, unknown> {
  if (fs.existsSync(env)) {
    return dotenv.parse(fs.readFileSync(env));
  }
  return {};
}
export function getServerConfig() {
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${process.env.NODE_ENV || 'development'}`);
  const config = { ...defaultConfig, ...envConfig };
  return config;
}

function getEntitiesDir() {
  return process.env.NODE_ENV === 'test' ? [`${__dirname}/**/*.entity.ts`] : [`${__dirname}/**/*.entity{.js,.ts}`];
}

// 通过 dotEnv 来解析不同的配置
export function getConnectionParams() {
  const config = getServerConfig();
  const entitiesDir = getEntitiesDir();
  return {
    type: config[ConfigEnum.DB_TYPE],
    host: config[ConfigEnum.DB_HOST],
    port: config[ConfigEnum.DB_PORT],
    username: config[ConfigEnum.DB_USERNAME],
    password: config[ConfigEnum.DB_PASSWORD],
    database: config[ConfigEnum.DB_DATABASE],
    synchronize: config[ConfigEnum.DB_SYNC] === 'true',
    logging: config[ConfigEnum.DB_LOGGING] === 'true',
    entities: entitiesDir,
    redis: {
      host: config[ConfigEnum.REDIS_HOST],
      port: config[ConfigEnum.REDIS_PORT],
      password: config[ConfigEnum.REDIS_PASSWORD],
      db: config[ConfigEnum.REDIS_DB],
    },
  } as TypeOrmModuleOptions;
}

export const connectionParams = getConnectionParams();

export default new DataSource({
  ...connectionParams,
  migrations: ['src/migrations/**'],
  subscribers: [],
} as DataSourceOptions);
