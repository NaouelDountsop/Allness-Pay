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

  private buildKycBaseTemplate(content: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">AfrilinkPay</h2>
        ${content}
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Si vous avez des questions, contactez notre support.
        </p>
      </div>
    `;
  }

  async sendKycSubmitted(email: string, firstName: string): Promise<void> {
    const html = this.buildKycBaseTemplate(`
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Bonjour ${firstName},
      </p>
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Nous avons bien reçu votre dossier de vérification d'identité (KYC).
      </p>
      <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px; padding: 12px 16px; margin-bottom: 16px;">
        <p style="color: #0369a1; font-size: 13px; font-weight: 600; margin: 0;">
          Statut : Soumis
        </p>
        <p style="color: #0c4a6e; font-size: 12px; margin: 4px 0 0 0;">
          Votre dossier est en attente de vérification par nos équipes.
        </p>
      </div>
      <p style="color: #555; font-size: 13px;">
        Nous vous notifierons par e-mail dès que votre dossier sera examiné. Ce processus prend généralement moins de 24 heures.
      </p>
    `);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'AfrilinkPay — Dossier KYC reçu',
        html,
      });
      this.logger.log(`Email KYC soumis envoyé à ${email}`);
    } catch (err) {
      this.logger.error(`Échec envoi email KYC soumis à ${email}`, err);
    }
  }

  async sendKycUnderReview(email: string, firstName: string): Promise<void> {
    const html = this.buildKycBaseTemplate(`
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Bonjour ${firstName},
      </p>
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Votre dossier de vérification d'identité est en cours d'examen.
      </p>
      <div style="background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px; padding: 12px 16px; margin-bottom: 16px;">
        <p style="color: #854d0e; font-size: 13px; font-weight: 600; margin: 0;">
          Statut : En cours de vérification
        </p>
        <p style="color: #713f12; font-size: 12px; margin: 4px 0 0 0;">
          Nos équipes analysent actuellement vos documents.
        </p>
      </div>
      <p style="color: #555; font-size: 13px;">
        Vous recevrez une notification dès que la vérification sera terminée.
      </p>
    `);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'AfrilinkPay — Vérification KYC en cours',
        html,
      });
      this.logger.log(`Email KYC en cours envoyé à ${email}`);
    } catch (err) {
      this.logger.error(`Échec envoi email KYC en cours à ${email}`, err);
    }
  }

  async sendKycApproved(email: string, firstName: string): Promise<void> {
    const html = this.buildKycBaseTemplate(`
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Bonjour ${firstName},
      </p>
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Excellente nouvelle ! Votre vérification d'identité a été approuvée.
      </p>
      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px; padding: 12px 16px; margin-bottom: 16px;">
        <p style="color: #166534; font-size: 13px; font-weight: 600; margin: 0;">
          Statut : Approuvé
        </p>
        <p style="color: #14532d; font-size: 12px; margin: 4px 0 0 0;">
          Votre compte est maintenant entièrement vérifié.
        </p>
      </div>
      <p style="color: #555; font-size: 13px;">
        Vous avez maintenant accès à toutes les fonctionnalités d'AfrilinkPay, y compris les transactions et les virements.
      </p>
    `);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'AfrilinkPay — KYC Approuvé',
        html,
      });
      this.logger.log(`Email KYC approuvé envoyé à ${email}`);
    } catch (err) {
      this.logger.error(`Échec envoi email KYC approuvé à ${email}`, err);
    }
  }

  async sendKycRejected(
    email: string,
    firstName: string,
    reason?: string,
  ): Promise<void> {
    const reasonSection = reason
      ? `<p style="color: #555; font-size: 13px; margin-bottom: 12px;">
          <strong>Motif :</strong> ${reason}
        </p>`
      : '';

    const html = this.buildKycBaseTemplate(`
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Bonjour ${firstName},
      </p>
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Votre dossier de vérification d'identité n'a pas pu être validé.
      </p>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; padding: 12px 16px; margin-bottom: 16px;">
        <p style="color: #991b1b; font-size: 13px; font-weight: 600; margin: 0;">
          Statut : Refusé
        </p>
        <p style="color: #7f1d1d; font-size: 12px; margin: 4px 0 0 0;">
          Votre dossier n'a pas été approuvé.
        </p>
      </div>
      ${reasonSection}
      <p style="color: #555; font-size: 13px;">
        Vous pouvez soumettre un nouveau dossier en corrigeant les points mentionnés. Si vous avez des questions, n'hésitez pas à contacter notre support.
      </p>
    `);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'AfrilinkPay — KYC Refusé',
        html,
      });
      this.logger.log(`Email KYC refusé envoyé à ${email}`);
    } catch (err) {
      this.logger.error(`Échec envoi email KYC refusé à ${email}`, err);
    }
  }

  async sendKycRequiresInfo(
    email: string,
    firstName: string,
    requestDetails?: string,
  ): Promise<void> {
    const detailsSection = requestDetails
      ? `<p style="color: #555; font-size: 13px; margin-bottom: 12px;">
          <strong>Informations demandées :</strong> ${requestDetails}
        </p>`
      : '';

    const html = this.buildKycBaseTemplate(`
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Bonjour ${firstName},
      </p>
      <p style="color: #555; font-size: 14px; margin-bottom: 16px;">
        Nous avons besoin d'informations complémentaires pour traiter votre dossier de vérification d'identité.
      </p>
      <div style="background: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px; padding: 12px 16px; margin-bottom: 16px;">
        <p style="color: #9a3412; font-size: 13px; font-weight: 600; margin: 0;">
          Statut : Informations complémentaires requises
        </p>
        <p style="color: #7c2d12; font-size: 12px; margin: 4px 0 0 0;">
          Veuillez mettre à jour votre dossier avec les informations demandées.
        </p>
      </div>
      ${detailsSection}
      <p style="color: #555; font-size: 13px;">
        Connectez-vous à votre compte AfrilinkPay pour soumettre les informations manquantes. Sans action de votre part, le traitement de votre dossier sera suspendu.
      </p>
    `);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'AfrilinkPay — Informations complémentaires requises',
        html,
      });
      this.logger.log(`Email KYC infos requises envoyé à ${email}`);
    } catch (err) {
      this.logger.error(`Échec envoi email KYC infos requises à ${email}`, err);
    }
  }
}
