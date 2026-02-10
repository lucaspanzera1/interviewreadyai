import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserFollow, UserFollowDocument } from './schemas/user-follow.schema';
import { QuizAttempt, QuizAttemptDocument } from '../quiz/schemas/quiz-attempt.schema';
import {
  SearchUsersDto,
  PublicUserDto,
  UserConnectionsDto,
} from './dto/social.dto';
import { UserService } from './user.service';
import { forwardRef, Inject } from '@nestjs/common';

/**
 * Service para funcionalidades de rede social
 * Gerencia seguir/deixar de seguir usuários, busca e perfis públicos
 */
@Injectable()
export class UserSocialService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserFollow.name)
    private readonly userFollowModel: Model<UserFollowDocument>,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) { }

  /**
   * Busca usuários com filtros
   */
  async searchUsers(searchDto: SearchUsersDto, currentUserId: string): Promise<{
    users: PublicUserDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, email, name, techArea } = searchDto;
    const skip = (page - 1) * limit;

    // Construir filtros de busca
    const filters: any = { active: true, isProfilePublic: true };

    if (email) {
      filters.email = { $regex: email, $options: 'i' };
    }

    if (name) {
      filters.name = { $regex: name, $options: 'i' };
    }

    if (techArea) {
      filters.techArea = techArea;
    }

    // Buscar usuários
    const [users, total] = await Promise.all([
      this.userModel
        .find(filters)
        .select('name email picture bio location careerTime techArea techStack linkedinUrl githubUrl')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filters),
    ]);

    // Converter para PublicUserDto com estatísticas
    const publicUsers = await Promise.all(
      users.map(user => this.buildPublicUserDto(user, currentUserId))
    );

    return {
      users: publicUsers,
      total,
      page,
      limit,
    };
  }

  /**
   * Buscar perfil público de um usuário
   */
  async getPublicProfile(userId: string, currentUserId: string): Promise<PublicUserDto> {
    const user = await this.userModel
      .findOne({ _id: userId, active: true, isProfilePublic: true })
      .select('name email picture bio location careerTime techArea techStack linkedinUrl githubUrl headerImage')
      .lean();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado ou perfil privado');
    }

    return this.buildPublicUserDto(user, currentUserId);
  }

  /**
   * Seguir um usuário
   */
  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('Você não pode seguir a si mesmo');
    }

    // Verificar se o usuário a ser seguido existe e tem perfil público
    const userExists = await this.userModel.exists({ _id: followingId, active: true, isProfilePublic: true });
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado ou perfil privado');
    }

    // Verificar se já está seguindo
    const existingFollow = await this.userFollowModel.findOne({
      followerId,
      followingId,
      active: true,
    });

    if (existingFollow) {
      throw new BadRequestException('Você já está seguindo este usuário');
    }

    // Criar ou reativar relacionamento
    await this.userFollowModel.findOneAndUpdate(
      { followerId, followingId },
      { active: true },
      { upsert: true, new: true }
    );
  }

  /**
   * Deixar de seguir um usuário
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = await this.userFollowModel.findOne({
      followerId,
      followingId,
      active: true,
    });

    if (!follow) {
      throw new NotFoundException('Você não está seguindo este usuário');
    }

    follow.active = false;
    await follow.save();
  }

  /**
   * Obter conexões de um usuário (seguidores e seguindo)
   */
  async getUserConnections(userId: string, currentUserId: string): Promise<UserConnectionsDto> {
    const [followersData, followingData] = await Promise.all([
      // Seguidores
      this.userFollowModel
        .find({ followingId: userId, active: true })
        .populate('followerId', 'name picture bio location careerTime techArea')
        .lean(),
      // Seguindo
      this.userFollowModel
        .find({ followerId: userId, active: true })
        .populate('followingId', 'name picture bio location careerTime techArea')
        .lean(),
    ]);

    const followers = await Promise.all(
      followersData.map(f => this.buildPublicUserDto((f as any).followerId, currentUserId))
    );

    const following = await Promise.all(
      followingData.map(f => this.buildPublicUserDto((f as any).followingId, currentUserId))
    );

    return {
      followers,
      following,
      followersCount: followers.length,
      followingCount: following.length,
    };
  }

  /**
   * Verificar se um usuário está sendo seguido por outro
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.userFollowModel.findOne({
      followerId,
      followingId,
      active: true,
    });
    return !!follow;
  }

  /**
   * Construir DTO público do usuário com estatísticas
   */
  private async buildPublicUserDto(user: any, currentUserId: string): Promise<PublicUserDto> {
    const userId = user._id.toString();

    // Buscar estatísticas em paralelo
    const [
      followersCount,
      followingCount,
      isFollowing,
      quizStats,
      combinedActivity,
    ] = await Promise.all([
      this.userFollowModel.countDocuments({ followingId: userId, active: true }),
      this.userFollowModel.countDocuments({ followerId: userId, active: true }),
      this.isFollowing(currentUserId, userId),
      this.getUserQuizStats(userId),
      this.userService.getCombinedActivity(userId, 365),
    ]);

    const activityData = (combinedActivity || []).map(a => ({
      date: a.date,
      count: a.totalActivities
    }));

    return {
      id: userId,
      name: user.name,
      picture: user.picture,
      headerImage: user.headerImage && !user.headerImage.startsWith('/api/')
        ? `/api${user.headerImage}`
        : user.headerImage,
      bio: user.bio,
      location: user.location,
      careerTime: user.careerTime,
      techArea: user.techArea,
      techStack: user.techStack || [],
      linkedinUrl: user.linkedinUrl,
      githubUrl: user.githubUrl,
      followersCount,
      followingCount,
      isFollowing,
      quizStats,
      activityData,
    };
  }

  /**
   * Obter estatísticas de quiz de um usuário
   */
  private async getUserQuizStats(userId: string): Promise<{
    totalCompleted: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
  }> {
    const attempts = await this.quizAttemptModel
      .find({ userId, completed: true })
      .select('score percentage timeSpent')
      .lean();

    if (attempts.length === 0) {
      return {
        totalCompleted: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
      };
    }

    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
    const totalTime = attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);
    const bestScore = Math.max(...attempts.map(a => a.percentage));

    return {
      totalCompleted: attempts.length,
      averageScore: Math.round(totalScore / attempts.length),
      bestScore,
      totalTimeSpent: totalTime,
    };
  }
}