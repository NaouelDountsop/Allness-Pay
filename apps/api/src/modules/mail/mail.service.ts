import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('smtp.host');
    const port = this.config.get<number>('smtp.port');
    const secure = this.config.get<boolean>('smtp.secure');
    const user = this.config.get<string>('smtp.user');
    const pass = this.config.get<string>('smtp.pass');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const smtpFrom = this.config.get<string>('smtp.from');
    const message = {
      from: smtpFrom,
      to,
      subject,
      html,
    };

    this.logger.log(`Envoi d'email à ${to} via ${this.config.get<string>('smtp.host')}:${this.config.get<number>('smtp.port')}`);

    try {
      const result = await this.transporter.sendMail(message);
      this.logger.log(`Email envoyé avec succès à ${to} (messageId=${result.messageId})`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email à ${to}`, error as Error);
      throw error;
    }
  }

  async sendOtpEmail(email: string, otp: string) {
    const html = `
      <p>Bonjour,</p>
      <p>Votre code de vérification est : <strong>${otp}</strong></p>
      <p>Il expire dans 10 minutes.</p>
    `;
    return this.sendMail(email, 'Votre code OTP AfriLinkPay', html);
  }
}