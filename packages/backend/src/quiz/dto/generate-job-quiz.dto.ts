import { IsString, IsUrl } from 'class-validator';

export class GenerateJobQuizDto {
  @IsString()
  @IsUrl()
  jobUrl: string;
}
