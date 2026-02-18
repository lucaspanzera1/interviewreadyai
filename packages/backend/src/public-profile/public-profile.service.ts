import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { QuizAttempt, QuizAttemptDocument } from '../quiz/schemas/quiz-attempt.schema';
import { UserService } from '../user/user.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class PublicProfileService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async getBadgeSvg(userId: string): Promise<string> {
    const user = await this.userModel
      .findById(userId)
      .select('name isProfilePublic active')
      .lean();

    if (!user || !user.active) {
      return this.renderErrorSvg('Perfil Não Encontrado');
    }

    if (!user.isProfilePublic) {
      return this.renderErrorSvg('Perfil Privado');
    }

    const [quizStats, activityData] = await Promise.all([
      this.getUserQuizStats(userId),
      this.userService.getCombinedActivity(userId, 30),
    ]);

    const totalActivity = (activityData || []).reduce(
      (sum, a) => sum + (a.totalActivities || 0),
      0,
    );

    return this.renderBadgeSvg({
      name: user.name,
      totalCompleted: quizStats.totalCompleted,
      averageScore: quizStats.averageScore,
      totalActivity,
    });
  }

  private async getUserQuizStats(userId: string) {
    const attempts = await this.quizAttemptModel
      .find({ userId, completed: true })
      .select('score percentage timeSpent')
      .lean();

    if (attempts.length === 0) {
      return { totalCompleted: 0, averageScore: 0, bestScore: 0, totalTimeSpent: 0 };
    }

    const totalScore = attempts.reduce((sum, a) => sum + a.percentage, 0);
    const totalTime = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    const bestScore = Math.max(...attempts.map((a) => a.percentage));

    return {
      totalCompleted: attempts.length,
      averageScore: Math.round(totalScore / attempts.length),
      bestScore,
      totalTimeSpent: totalTime,
    };
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private renderBadgeSvg(data: {
    name: string;
    totalCompleted: number;
    averageScore: number;
    totalActivity: number;
  }): string {
    const name = this.escapeXml(data.name);
    return `<svg width="380" height="150" viewBox="0 0 380 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="380" height="150" rx="10" fill="#0D1117" stroke="#30363D" stroke-width="1"/>
  <text x="20" y="32" fill="#58A6FF" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold">🏆 TreinaVaga Stats</text>
  <text x="20" y="54" fill="#8B949E" font-family="Arial, Helvetica, sans-serif" font-size="12">${name}</text>
  <line x1="20" y1="66" x2="360" y2="66" stroke="#21262D" stroke-width="1"/>
  <text x="20" y="90" fill="#C9D1D9" font-family="Arial, Helvetica, sans-serif" font-size="13">Quizzes Completos:</text>
  <text x="360" y="90" fill="#58A6FF" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" text-anchor="end">${data.totalCompleted}</text>
  <text x="20" y="112" fill="#C9D1D9" font-family="Arial, Helvetica, sans-serif" font-size="13">Média de Score:</text>
  <text x="360" y="112" fill="#58A6FF" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" text-anchor="end">${data.averageScore}%</text>
  <text x="20" y="134" fill="#C9D1D9" font-family="Arial, Helvetica, sans-serif" font-size="13">Atividades Recentes (30d):</text>
  <text x="360" y="134" fill="#58A6FF" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="bold" text-anchor="end">${data.totalActivity}</text>
</svg>`;
  }

  private renderErrorSvg(message: string): string {
    const escaped = this.escapeXml(message);
    return `<svg width="380" height="80" viewBox="0 0 380 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="380" height="80" rx="10" fill="#0D1117" stroke="#30363D" stroke-width="1"/>
  <text x="190" y="35" fill="#58A6FF" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">TreinaVaga</text>
  <text x="190" y="58" fill="#F85149" font-family="Arial, Helvetica, sans-serif" font-size="13" text-anchor="middle">${escaped}</text>
</svg>`;
  }
}
