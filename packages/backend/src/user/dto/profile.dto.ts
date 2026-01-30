import { IsOptional, IsString, IsArray, IsBoolean, IsIn } from 'class-validator';

export class ProfileDto {
  @IsOptional()
  @IsString()
  careerTime?: string;

  @IsOptional()
  @IsString()
  techArea?: string;

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
}

export class CompleteOnboardingDto extends ProfileDto {
  @IsBoolean()
  hasCompletedOnboarding: boolean = true;
}