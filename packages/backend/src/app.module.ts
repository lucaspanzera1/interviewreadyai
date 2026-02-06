import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { QuizModule } from './quiz/quiz.module';
import { TokenPackageModule } from './token-package/token-package.module';
import { RoleModule } from './role/role.module';
import { EmailModule } from './common/email.module';
import { PlansModule } from './plans/plans.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Módulo principal da aplicação
 * Configura todos os módulos, banco de dados (MongoDB) e variáveis de ambiente
 */
@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : ['.env.local', '.env'],
    }),
    
    // Módulo de agendamento de tarefas
    ScheduleModule.forRoot(),
    
    // Módulo de email
    EmailModule,
    
    // Módulo de banco de dados (MongoDB)
    DatabaseModule,
    
    // Módulos de funcionalidade
    AuthModule,
    UserModule,
    QuizModule,
    TokenPackageModule,
    RoleModule,
    PlansModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}