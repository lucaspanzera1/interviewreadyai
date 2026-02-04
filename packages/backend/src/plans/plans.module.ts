import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlansController } from './plans.controller';
import { AbacatePayWebhookController } from './abacatepay-webhook.controller';
import { PlansService } from './plans.service';
import { TokenPackageModule } from '../token-package/token-package.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [HttpModule, TokenPackageModule, UserModule],
  controllers: [PlansController, AbacatePayWebhookController],
  providers: [PlansService],
})
export class PlansModule {}