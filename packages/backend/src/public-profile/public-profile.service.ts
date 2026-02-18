import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { QuizAttempt, QuizAttemptDocument } from '../quiz/schemas/quiz-attempt.schema';
import { UserService } from '../user/user.service';

const THEMES = {
  light: {
    bg: '#ffffff',
    border: '#e2e8f0', // slate-200
    title: '#0f172a', // slate-900
    subtext: '#64748b', // slate-500
    text: '#334155', // slate-700
    accent: '#4f46e5', // indigo-600
    iconBg: '#eef2ff', // indigo-50
    divider: '#f1f5f9', // slate-100
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    bg: '#0f172a', // slate-900
    border: '#1e293b', // slate-800
    title: '#f8fafc', // slate-50
    subtext: '#94a3b8', // slate-400
    text: '#e2e8f0', // slate-200
    accent: '#818cf8', // indigo-400
    iconBg: 'rgba(99, 102, 241, 0.1)', // indigo-500/10
    divider: '#1e293b', // slate-800
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  dracula: {
    bg: '#282a36',
    border: '#44475a',
    title: '#f8f8f2',
    subtext: '#6272a4',
    text: '#f8f8f2',
    accent: '#bd93f9', // purple
    iconBg: 'rgba(189, 147, 249, 0.1)',
    divider: '#44475a',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

@Injectable()
export class PublicProfileService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) { }

  async getBadgeSvg(userId: string, theme: string = 'light'): Promise<string> {
    const user = await this.userModel
      .findById(userId)
      .select('name isProfilePublic active picture')
      .lean();

    const selectedTheme = THEMES[theme] || THEMES.light;

    if (!user || !user.active) {
      return this.renderErrorSvg('Perfil Não Encontrado', selectedTheme);
    }

    if (!user.isProfilePublic) {
      return this.renderErrorSvg('Perfil Privado', selectedTheme);
    }

    const [quizStats, activityData] = await Promise.all([
      this.getUserQuizStats(userId),
      this.userService.getCombinedActivity(userId, 30),
    ]);

    const totalActivity = (activityData || []).reduce(
      (sum, a) => sum + (a.totalActivities || 0),
      0,
    );

    return this.renderBadgeSvg(
      {
        name: user.name,
        picture: user.picture,
        totalCompleted: quizStats.totalCompleted,
        averageScore: quizStats.averageScore,
        totalActivity,
        bestScore: quizStats.bestScore,
      },
      selectedTheme,
    );
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
      bestScore: Math.round(bestScore),
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

  private renderBadgeSvg(
    data: {
      name: string;
      picture?: string;
      totalCompleted: number;
      averageScore: number;
      totalActivity: number;
      bestScore: number;
    },
    theme: any,
  ): string {
    const name = this.escapeXml(data.name);
    // Use a default avatar if none provided
    const avatar = data.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.name) + '&background=random';

    return `<svg width="495" height="170" viewBox="0 0 495 170" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <filter id="shadow" x="-4" y="-4" width="503" height="178" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
    </filter>
    <clipPath id="avatarClip">
      <circle cx="455" cy="37" r="16" />
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="495" height="170" rx="16" fill="${theme.bg}"/>
  <rect x="0.5" y="0.5" width="494" height="169" rx="15.5" stroke="${theme.border}" stroke-opacity="0.8"/>

  <!-- Header -->
  <g transform="translate(24, 24)">
    <!-- Logo Image -->
    <image href="https://app.treinavaga.tech/logo.png" x="0" y="0" height="32" width="32" />
    
    <!-- Brand Name -->
    <text x="42" y="22" fill="${theme.title}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="bold">TreinaVagaAI</text>
  </g>

  <!-- User Info (Right Aligned) -->
  <g>
    <!-- Avatar -->
    <image href="${avatar}" x="439" y="21" height="32" width="32" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice" />
    <circle cx="455" cy="37" r="16" stroke="${theme.border}" stroke-width="1" fill="none"/>

    <!-- Name -->
    <text x="429" y="42" fill="${theme.subtext}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="500" text-anchor="end">${name}</text>
  </g>

  <!-- Divider -->
  <line x1="24" y1="72" x2="471" y2="72" stroke="${theme.divider}" stroke-width="1"/>

  <!-- Stats Grid -->
  <g transform="translate(42, 100)">
    
    <!-- Stat 1: Quizzes -->
    <g transform="translate(0, 0)">
      <circle cx="20" cy="20" r="20" fill="${theme.iconBg}"/>
      <path d="M15 20l3.5 3.5 6.5-6.5" stroke="${theme.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="52" y="14" fill="${theme.subtext}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="0.5">QUIZZES</text>
      <text x="52" y="34" fill="${theme.title}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="bold">${data.totalCompleted}</text>
    </g>

    <!-- Stat 2: Score -->
    <g transform="translate(150, 0)">
      <circle cx="20" cy="20" r="20" fill="${theme.iconBg}"/>
      <path d="M18 26V14M12 26V19M24 26V10" stroke="${theme.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="52" y="14" fill="${theme.subtext}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="0.5">MÉDIA</text>
      <text x="52" y="34" fill="${theme.title}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="bold">${data.averageScore}%</text>
    </g>

    <!-- Stat 3: Best Score -->
    <g transform="translate(290, 0)">
      <circle cx="20" cy="20" r="20" fill="${theme.iconBg}"/>
      <path d="M12 11h16M13.5 11v4c0 3.5 2.5 6.5 6.5 6.5s6.5-3 6.5-6.5v-4M16 21.5v3.5M12 29h16" stroke="${theme.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="52" y="14" fill="${theme.subtext}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="0.5">MELHOR SCORE</text>
      <text x="52" y="34" fill="${theme.title}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="bold">${data.bestScore}%</text>
    </g>

  </g>
</svg>`;
  }

  private renderErrorSvg(message: string, theme: any): string {
    const escaped = this.escapeXml(message);
    return `<svg width="450" height="100" viewBox="0 0 450 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="450" height="100" rx="16" fill="${theme.bg}"/>
  <rect x="0.5" y="0.5" width="449" height="99" rx="15.5" stroke="${theme.border}" stroke-opacity="0.8"/>
  <circle cx="225" cy="35" r="16" fill="${theme.iconBg}"/>
  <text x="225" y="42" fill="${theme.title}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">TreinaVaga</text>
  <text x="225" y="75" fill="${theme.subtext}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" text-anchor="middle">${escaped}</text>
</svg>`;
  }
}
