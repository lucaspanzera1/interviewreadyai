import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenPackageController } from './token-package.controller';
import { TokenPackageService } from './token-package.service';
import { TokenPackage, TokenPackageSchema } from './schemas/token-package.schema';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenPackage.name, schema: TokenPackageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TokenPackageController],
  providers: [TokenPackageService],
  exports: [TokenPackageService],
})
export class TokenPackageModule {}