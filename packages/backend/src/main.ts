import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as bodyParser from 'body-parser';

/**
 * Bootstrap da aplicação NestJS
 * Configura validação, CORS, Swagger e inicia o servidor
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  // Captura o rawBody para validação de assinatura do webhook AbacatePay
  app.use(bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }));

  // Configuração de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true,
  });

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