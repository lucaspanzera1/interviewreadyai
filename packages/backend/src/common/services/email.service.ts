import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { t, SupportedLanguage } from '../i18n';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Envia email de boas-vindas para novo usuário
   */
  async sendWelcomeEmail(email: string, name: string, lang: SupportedLanguage = 'pt-BR'): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: t('email.welcomeSubject', lang),
        template: lang === 'en' ? 'welcome-en' : 'welcome',
        context: {
          name: name,
          email: email,
          appUrl: process.env.FRONTEND_URL || 'https://app.treinavaga.ai',
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      // Não lança erro para não quebrar o fluxo de cadastro
    }
  }

  /**
   * Envia email informando adição de tokens
   */
  async sendTokenAddedEmail(
    email: string,
    name: string,
    amount: number,
    reason: string,
    newBalance: number,
    lang: SupportedLanguage = 'pt-BR'
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: t('email.tokenAddedSubject', lang),
        template: lang === 'en' ? 'token-added-en' : 'token-added',
        context: {
          name: name,
          amount: amount,
          reason: reason,
          newBalance: newBalance,
          appUrl: process.env.FRONTEND_URL || 'https://app.treinavaga.ai',
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email de adição de tokens:', error);
      // Não lança erro para não quebrar o fluxo
    }
  }

  /**
   * Envia email informando resgate de plano
   */
  async sendPlanRedeemedEmail(
    email: string,
    name: string,
    planName: string,
    planDescription: string,
    tokensAdded: number,
    newTokenBalance: number,
    newRole?: string,
    roleExpiresAt?: string,
    lang: SupportedLanguage = 'pt-BR'
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: t('email.planRedeemedSubject', lang),
        template: lang === 'en' ? 'plan-redeemed-en' : 'plan-redeemed',
        context: {
          name: name,
          planName: planName,
          planDescription: planDescription,
          tokensAdded: tokensAdded,
          newTokenBalance: newTokenBalance,
          newRole: newRole,
          roleExpiresAt: roleExpiresAt,
          appUrl: process.env.FRONTEND_URL || 'https://app.treinavaga.ai',
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email de resgate de plano:', error);
      // Não lança erro para não quebrar o fluxo
    }
  }

  /**
   * Envia email genérico
   */
  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any = {},
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      // Não lança erro para não quebrar o fluxo
    }
  }
}