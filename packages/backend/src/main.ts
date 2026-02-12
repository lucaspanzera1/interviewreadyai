import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

/**
 * Bootstrap da aplicação NestJS
 * Configura validação, CORS, Swagger e inicia o servidor
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  // Configuração de arquivos estáticos
  const publicPath = process.env.NODE_ENV === 'production' 
    ? join(__dirname, 'public')
    : join(process.cwd(), 'public');
  
  app.useStaticAssets(publicPath, {
    prefix: '/api/uploads/',
  });

  // Captura o rawBody para validação de assinatura do webhook AbacatePay
  app.use(bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }));

  // Configuração de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:8080',
    credentials: true,
  });

  // Configuração do WebSocket Adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Configuração de validação global
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //   }),
  // );

  // Configuração do filtro global de exceções
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('TreinaVaga')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Porta do servidor
  const port = process.env.BACKEND_PORT || 8081;
  
  await app.listen(port);
  console.log(`🚀 API running on: http://localhost:${port}`);
}

bootstrap();