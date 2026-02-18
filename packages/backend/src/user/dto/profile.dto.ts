import { IsOptional, IsString, IsArray, IsBoolean, IsIn } from 'class-validator';

export class ProfileDto {
  @IsOptional()
  @IsString()
  careerTime?: string;

  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  cellphone?: string;

  @IsOptional()
  @IsString()
  taxid?: string;

  @IsOptional()
  @IsString()
  headerImage?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pt-BR', 'en'])
  preferredLanguage?: string;
}

export class CompleteOnboardingDto extends ProfileDto {
  @IsBoolean()
  hasCompletedOnboarding: boolean = true;
}