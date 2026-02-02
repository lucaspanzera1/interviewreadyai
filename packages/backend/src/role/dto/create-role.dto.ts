import { IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsHexColor()
  color: string;
}