import { IsEmail, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchUsersDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  techArea?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}

export class FollowUserDto {
  @IsString()
  userId: string;
}

export class UnfollowUserDto {
  @IsString()
  userId: string;
}

export class PublicUserDto {
  id: string;
  name: string;
  picture?: string;
  bio?: string;
  location?: string;
  careerTime?: string;
  techArea?: string;
  techStack?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  quizStats: {
    totalCompleted: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
  };
}

export class UserConnectionsDto {
  followers: PublicUserDto[];
  following: PublicUserDto[];
  followersCount: number;
  followingCount: number;
}