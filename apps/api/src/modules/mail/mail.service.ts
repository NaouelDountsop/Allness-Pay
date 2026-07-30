import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { MailConfig } from '@/config/configuration';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    const mail = this.config.getOrThrow<MailConfig>('mail');

    this.transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth: mail.user ? { user: mail.user, pass: mail.pass } : undefined,
    });

    this.from = mail.from;
  }

  async sendOtp(email: string, otpCode: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">AfrilinkPay</h2>
        <p style="color: #555; font-size: 14px; margin-bottom: 24px;">
          Voici votre code de vérification :
        </p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #999; font-size: 12px;">
          Ce code expire dans 5 minutes. Ne partagez ce code avec personne.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'AfrilinkPay — Code de vérification',
        html,
      });
      this.logger.log(`OTP envoyé à ${email}`);
    } catch (err) {
      this.logger.error(`Échec envoi OTP à ${email}`, err);
      // On ne bloque pas l'inscription si l'email échoue
    }
  }
}
