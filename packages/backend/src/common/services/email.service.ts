import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Envia email de boas-vindas para novo usuário
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bem-vindo ao TreinaVagaAI! 🚀',
        template: 'welcome',
        context: {
          name: name,
          email: email,
          year: new Date().getFullYear(),
        },
      });
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      // Não lança erro para não quebrar o fluxo de cadastro
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