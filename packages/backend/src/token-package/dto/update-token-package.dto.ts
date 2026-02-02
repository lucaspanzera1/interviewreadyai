import { PartialType } from '@nestjs/mapped-types';
import { CreateTokenPackageDto } from './create-token-package.dto';

export class UpdateTokenPackageDto extends PartialType(CreateTokenPackageDto) {}