import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MigrationService } from '../user/migration.service';

async function runMigration() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    await migrationService.migrateTechAreaToNiche();
    console.log('Migração executada com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error);
  } finally {
    await app.close();
  }
}

runMigration();