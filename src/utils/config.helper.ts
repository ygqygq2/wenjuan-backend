import * as fs from 'fs';

import * as dotenv from 'dotenv';
// 通过环境变量读取不同的. env 文件
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

export function getEntitiesDir() {
  return process.env.NODE_ENV === 'test'
    ? [`${__dirname}/../**/*.entity.ts`]
    : [`${__dirname}/../**/*.entity{.js,.ts}`];
}
