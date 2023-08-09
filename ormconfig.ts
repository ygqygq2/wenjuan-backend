import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as tsconfigPaths from 'tsconfig-paths';

import { DataSource, DataSourceOptions } from 'typeorm';

import { ConfigEnum } from './src/enum/config.enum';
import { getEntitiesDir, getServerConfig } from './src/utils/config.helper';

// 解析 TypeScript 别名
const baseUrl = '.';
const paths = {
  '@/*': ['./src/*'],
};

tsconfigPaths.register({
  baseUrl,
  paths,
});

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
  } as TypeOrmModuleOptions;
}

export const connectionParams = getConnectionParams();

export default new DataSource({
  ...connectionParams,
  migrations: ['src/migrations/**'],
  subscribers: [],
} as DataSourceOptions);
