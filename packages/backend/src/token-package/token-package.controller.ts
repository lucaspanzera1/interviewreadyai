import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Headers } from '@nestjs/common';
import { TokenPackageService } from './token-package.service';
import { CreateTokenPackageDto } from './dto/create-token-package.dto';
import { UpdateTokenPackageDto } from './dto/update-token-package.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('token-packages')
@UseGuards(RolesGuard)
export class TokenPackageController {
  constructor(private readonly tokenPackageService: TokenPackageService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createTokenPackageDto: CreateTokenPackageDto) {
    return this.tokenPackageService.create(createTokenPackageDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.tokenPackageService.findAll();
  }

  @Get('available')
  @Public()
  async findAvailable(@Headers('accept-language') acceptLang?: string) {
    const packages = await this.tokenPackageService.findAll();
    const isEn = acceptLang?.startsWith('en');
    return packages.map((pkg: any) => {
      const json = typeof pkg.toJSON === 'function' ? pkg.toJSON() : { ...pkg };
      if (isEn) {
        if (json.nameEn) json.name = json.nameEn;
        if (json.featuresEn?.length) json.features = json.featuresEn;
      }
      return json;
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.tokenPackageService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateTokenPackageDto: UpdateTokenPackageDto) {
    return this.tokenPackageService.update(id, updateTokenPackageDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.tokenPackageService.remove(id);
  }

  @Post(':id/redeem')
  async redeem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tokenPackageService.redeem(id, user);
  }
}