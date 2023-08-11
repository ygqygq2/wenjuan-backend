import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setupApp } from './setup';
import { getServerConfig } from './utils/config.helper';
// import {AllExceptionFilter} from './filters/all-exception.filter';

async function bootstrap() {
  const config = getServerConfig();
  // 切换 fastify
  // const app= await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {});
  // 默认 express
  // 允许跨域
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });
  setupApp(app);

  const port = typeof config['APP_PORT'] === 'string' ? parseInt(config['APP_PORT'], 10) : 3000;
  await app.listen(port, '0.0.0.0');
  await app.init();

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
