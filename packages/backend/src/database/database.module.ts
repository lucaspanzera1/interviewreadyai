import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

/**
 * Módulo de banco de dados
 * Configura conexão com MongoDB
 */
@Global()
@Module({
  imports: [
    // MongoDB Configuration
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') ||
          'mongodb://admin:password@localhost:27017/treinavagaai?authSource=admin',
      }),
      inject: [ConfigService],
    }),

  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}