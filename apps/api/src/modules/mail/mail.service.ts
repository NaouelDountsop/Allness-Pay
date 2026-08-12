import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { MailConfig } from '@/config/configuration';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly frontendUrl: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    const mail = this.config.getOrThrow<MailConfig>('mail');

    this.transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth: mail.user
        ? {
            user: mail.user,
            pass: mail.pass,
          }
        : undefined,
    });

    this.from = mail.from;
    this.frontendUrl = mail.frontendUrl;
  }

  // ============================================================
  // UTILITAIRES
  // ============================================================

  /**
   * Protège les valeurs dynamiques avant insertion dans du HTML.
   */
  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Template principal des emails AfriLinkPay.
   */
  private buildTemplate(
    content: string,
    options?: {
      preheader?: string;
    },
  ): string {
    const preheader = options?.preheader ?? '';

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta name="x-apple-disable-message-reformatting" />

  <title>AfriLinkPay</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f7f6;
      font-family: Arial, Helvetica, sans-serif;
      color: #082B37;
    }

    table {
      border-collapse: collapse;
    }

    a {
      color: inherit;
    }

    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }

      .content {
        padding: 24px !important;
      }

      .button {
        width: 100% !important;
      }
    }
  </style>
</head>

<body>

  <!-- Preheader -->
  <div
    style="
      display:none;
      max-height:0;
      overflow:hidden;
      opacity:0;
      color:transparent;
    "
  >
    ${this.escapeHtml(preheader)}
  </div>

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background-color:#f4f7f6;"
  >
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table
          role="presentation"
          class="container"
          width="600"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width:600px;
            max-width:600px;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 4px 20px rgba(8,43,55,0.08);
          "
        >

          <!-- HEADER -->
          <tr>
            <td
              style="
                background:#082B37;
                padding:24px 32px;
              "
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>

                  <td
                    style="
                      font-size:22px;
                      font-weight:700;
                      color:#ffffff;
                    "
                  >
                    <span
                      style="
                        display:inline-block;
                        background:#D28E2F;
                        color:#082B37;
                        width:34px;
                        height:34px;
                        line-height:34px;
                        text-align:center;
                        border-radius:9px;
                        font-weight:800;
                        margin-right:8px;
                      "
                    >
                      A
                    </span>

                    AfriLink
                    <span style="color:#D28E2F;">
                      Pay
                    </span>
                  </td>

                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td
              class="content"
              style="
                padding:36px 40px;
              "
            >
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              style="
                padding:24px 32px;
                background:#f8faf9;
                border-top:1px solid #e8eeee;
              "
            >

              <p
                style="
                  margin:0 0 8px;
                  font-size:12px;
                  color:#64777c;
                  text-align:center;
                "
              >
                Cet email a été envoyé automatiquement par AfriLinkPay.
              </p>

              <p
                style="
                  margin:0;
                  font-size:11px;
                  color:#8a999d;
                  text-align:center;
                "
              >
                © ${new Date().getFullYear()} AfriLinkPay.
                Tous droits réservés.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
  }

  /**
   * Envoi centralisé des emails.
   */
  private async sendMail(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: {
          name: 'AfriLinkPay',
          address: this.from,
        },

        to: params.to,

        subject: params.subject,

        html: params.html,

        text: params.text,

        // Important :
        // On évite volontairement les headers
        // "Precedence: bulk" et "List-Unsubscribe"
        // pour les emails transactionnels.
      });

      this.logger.log(`Email envoyé avec succès à ${params.to} — ${params.subject}`);
    } catch (error) {
      this.logger.error(
        `Échec d'envoi de l'email à ${params.to}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }

  // ============================================================
  // OTP
  // ============================================================

  async sendOtp(email: string, otpCode: string): Promise<void> {
    const safeOtp = this.escapeHtml(otpCode);

    const html = this.buildTemplate(
      `
        <h1
          style="
            margin:0 0 16px;
            font-size:26px;
            color:#082B37;
          "
        >
          Vérifiez votre adresse email
        </h1>

        <p
          style="
            margin:0 0 24px;
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Utilisez le code ci-dessous pour confirmer votre adresse
          email sur AfriLinkPay.
        </p>

        <div
          style="
            background:#f4f7f6;
            border:1px solid #e2eae8;
            border-radius:12px;
            padding:24px;
            text-align:center;
            margin-bottom:24px;
          "
        >
          <div
            style="
              font-size:34px;
              font-weight:800;
              letter-spacing:10px;
              color:#082B37;
            "
          >
            ${safeOtp}
          </div>
        </div>

        <p
          style="
            margin:0 0 8px;
            font-size:13px;
            color:#64777c;
          "
        >
          Ce code expire dans <strong>5 minutes</strong>.
        </p>

        <p
          style="
            margin:0;
            font-size:13px;
            color:#64777c;
          "
        >
          Ne partagez jamais ce code avec quelqu'un d'autre.
        </p>
      `,
      {
        preheader: 'Votre code de vérification AfriLinkPay',
      },
    );

    const text = `
AfriLinkPay

Vérification de votre adresse email

Votre code de vérification est :

${otpCode}

Ce code expire dans 5 minutes.

Ne partagez jamais ce code avec quelqu'un d'autre.

AfriLinkPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Votre code de vérification AfriLinkPay',
      html,
      text,
    });
  }

  // ============================================================
  // KYC - SOUMIS
  // ============================================================

  async sendKycSubmitted(email: string, firstName: string): Promise<void> {
    const safeFirstName = this.escapeHtml(firstName);

    const html = this.buildTemplate(
      `
        <h1
          style="
            margin:0 0 16px;
            font-size:26px;
            color:#082B37;
          "
        >
          Dossier KYC reçu
        </h1>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Bonjour <strong>${safeFirstName}</strong>,
        </p>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Nous avons bien reçu votre dossier de vérification
          d'identité.
        </p>

        <div
          style="
            background:#eef8f4;
            border-left:4px solid #1FAF74;
            border-radius:8px;
            padding:16px;
            margin:24px 0;
          "
        >
          <strong style="color:#08734b;">
            Statut : Dossier soumis
          </strong>

          <p
            style="
              margin:8px 0 0;
              font-size:13px;
              color:#527069;
            "
          >
            Votre dossier est maintenant en attente de vérification
            par nos équipes.
          </p>
        </div>

        <p
          style="
            margin:0;
            font-size:13px;
            line-height:1.6;
            color:#64777c;
          "
        >
          Vous recevrez une notification lorsque votre dossier
          aura été examiné.
        </p>
      `,
      {
        preheader: 'Votre dossier KYC a bien été reçu',
      },
    );

    const text = `
AfriLinkPay

Bonjour ${firstName},

Nous avons bien reçu votre dossier de vérification d'identité.

Statut : Dossier soumis.

Votre dossier est maintenant en attente de vérification par nos équipes.

Vous recevrez une notification lorsque votre dossier aura été examiné.

AfriLinkPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Votre dossier KYC a été reçu — AfriLinkPay',
      html,
      text,
    });
  }

  // ============================================================
  // KYC - EN COURS
  // ============================================================

  async sendKycUnderReview(email: string, firstName: string): Promise<void> {
    const safeFirstName = this.escapeHtml(firstName);

    const html = this.buildTemplate(
      `
        <h1
          style="
            margin:0 0 16px;
            font-size:26px;
            color:#082B37;
          "
        >
          Vérification en cours
        </h1>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Bonjour <strong>${safeFirstName}</strong>,
        </p>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Votre dossier de vérification d'identité est actuellement
          en cours d'examen.
        </p>

        <div
          style="
            background:#fff8e8;
            border-left:4px solid #D28E2F;
            border-radius:8px;
            padding:16px;
            margin:24px 0;
          "
        >
          <strong style="color:#956313;">
            Statut : En cours de vérification
          </strong>

          <p
            style="
              margin:8px 0 0;
              font-size:13px;
              color:#746346;
            "
          >
            Nos équipes analysent actuellement vos documents.
          </p>
        </div>

        <p
          style="
            font-size:13px;
            color:#64777c;
          "
        >
          Vous recevrez une nouvelle notification lorsque la
          vérification sera terminée.
        </p>
      `,
      {
        preheader: 'Votre vérification KYC est en cours',
      },
    );

    const text = `
AfriLinkPay

Bonjour ${firstName},

Votre dossier de vérification d'identité est actuellement en cours d'examen.

Statut : En cours de vérification.

Nos équipes analysent actuellement vos documents.

Vous recevrez une nouvelle notification lorsque la vérification sera terminée.

AfriLinkPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Votre vérification KYC est en cours — AfriLinkPay',
      html,
      text,
    });
  }

  // ============================================================
  // KYC - APPROUVÉ
  // ============================================================

  async sendKycApproved(email: string, firstName: string): Promise<void> {
    const safeFirstName = this.escapeHtml(firstName);

    const html = this.buildTemplate(
      `
        <h1
          style="
            margin:0 0 16px;
            font-size:26px;
            color:#082B37;
          "
        >
          Vérification approuvée
        </h1>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Bonjour <strong>${safeFirstName}</strong>,
        </p>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Excellente nouvelle ! Votre vérification d'identité
          a été approuvée.
        </p>

        <div
          style="
            background:#eef8f4;
            border-left:4px solid #1FAF74;
            border-radius:8px;
            padding:16px;
            margin:24px 0;
          "
        >
          <strong style="color:#08734b;">
            ✓ Compte vérifié
          </strong>

          <p
            style="
              margin:8px 0 0;
              font-size:13px;
              color:#527069;
            "
          >
            Votre compte est maintenant entièrement vérifié.
          </p>
        </div>

        <p
          style="
            font-size:13px;
            line-height:1.6;
            color:#64777c;
          "
        >
          Vous pouvez maintenant accéder aux fonctionnalités
          disponibles sur AfriLinkPay.
        </p>
      `,
      {
        preheader: "Votre vérification d'identité a été approuvée",
      },
    );

    const text = `
AfriLinkPay

Bonjour ${firstName},

Excellente nouvelle ! Votre vérification d'identité a été approuvée.

Statut : Compte vérifié.

Votre compte est maintenant entièrement vérifié.

Vous pouvez maintenant accéder aux fonctionnalités disponibles sur AfriLinkPay.

AfriLinkPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Votre compte est vérifié — AfriLinkPay',
      html,
      text,
    });
  }

  // ============================================================
  // KYC - REFUSÉ
  // ============================================================

  async sendKycRejected(email: string, firstName: string, reason?: string): Promise<void> {
    const safeFirstName = this.escapeHtml(firstName);

    const safeReason = reason ? this.escapeHtml(reason) : undefined;

    const reasonSection = safeReason
      ? `
        <div
          style="
            background:#fff5f5;
            border-left:4px solid #dc2626;
            border-radius:8px;
            padding:16px;
            margin:24px 0;
          "
        >
          <strong style="color:#991b1b;">
            Motif du refus
          </strong>

          <p
            style="
              margin:8px 0 0;
              font-size:13px;
              line-height:1.6;
              color:#7f1d1d;
            "
          >
            ${safeReason}
          </p>
        </div>
      `
      : '';

    const html = this.buildTemplate(
      `
        <h1
          style="
            margin:0 0 16px;
            font-size:26px;
            color:#082B37;
          "
        >
          Vérification KYC non approuvée
        </h1>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Bonjour <strong>${safeFirstName}</strong>,
        </p>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Votre dossier de vérification d'identité n'a pas pu
          être validé.
        </p>

        ${reasonSection}

        <p
          style="
            font-size:13px;
            line-height:1.6;
            color:#64777c;
          "
        >
          Vous pouvez soumettre un nouveau dossier en corrigeant
          les éléments demandés.
        </p>
      `,
      {
        preheader: 'Une action est nécessaire concernant votre KYC',
      },
    );

    const text = `
AfriLinkPay

Bonjour ${firstName},

Votre dossier de vérification d'identité n'a pas pu être validé.

${
  reason
    ? `Motif du refus :
${reason}

`
    : ''
}
Vous pouvez soumettre un nouveau dossier en corrigeant les éléments demandés.

AfriLinkPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Action requise concernant votre KYC — AfriLinkPay',
      html,
      text,
    });
  }

  // ============================================================
  // TONTINE - INVITATION
  // ============================================================

  async sendTontineInvitation(
    email: string,
    inviterName: string,
    tontineName: string,
    token: string,
  ): Promise<void> {
    const safeInviterName = this.escapeHtml(inviterName);

    const safeTontineName = this.escapeHtml(tontineName);

    const acceptUrl = `${this.frontendUrl}/invitations/accept?token=${encodeURIComponent(token)}`;

    const html = this.buildTemplate(
      `
        <div
          style="
            text-align:center;
            margin-bottom:28px;
          "
        >
          <div
            style="
              display:inline-block;
              background:#eef8f4;
              color:#08734b;
              padding:8px 14px;
              border-radius:999px;
              font-size:12px;
              font-weight:700;
            "
          >
            INVITATION À UNE TONTINE
          </div>
        </div>

        <h1
          style="
            margin:0 0 16px;
            font-size:28px;
            line-height:1.25;
            text-align:center;
            color:#082B37;
          "
        >
          Vous êtes invité(e) !
        </h1>

        <p
          style="
            margin:0 0 24px;
            font-size:15px;
            line-height:1.7;
            text-align:center;
            color:#52666c;
          "
        >
          <strong>${safeInviterName}</strong>
          vous invite à rejoindre une tontine sur
          <strong>AfriLinkPay</strong>.
        </p>

        <div
          style="
            background:#f7faf9;
            border:1px solid #e3ebe8;
            border-radius:14px;
            padding:24px;
            margin-bottom:24px;
            text-align:center;
          "
        >
          <p
            style="
              margin:0 0 8px;
              font-size:12px;
              text-transform:uppercase;
              letter-spacing:0.5px;
              color:#829297;
            "
          >
            Tontine
          </p>

          <p
            style="
              margin:0;
              font-size:21px;
              font-weight:700;
              color:#082B37;
            "
          >
            ${safeTontineName}
          </p>
        </div>

        <p
          style="
            font-size:14px;
            line-height:1.7;
            color:#52666c;
            text-align:center;
            margin-bottom:28px;
          "
        >
          Rejoignez cette tontine pour participer à un système
          d'épargne collaborative simple, transparent et sécurisé.
        </p>

        <div style="text-align:center; margin:30px 0;">

          <a
            href="${acceptUrl}"
            class="button"
            style="
              display:inline-block;
              background:#0D3A47;
              color:#ffffff;
              padding:15px 28px;
              border-radius:10px;
              text-decoration:none;
              font-weight:700;
              font-size:14px;
            "
          >
            Accepter l'invitation
            <span style="color:#D28E2F;">
              →
            </span>
          </a>

        </div>

        <div
          style="
            border-top:1px solid #edf1f0;
            padding-top:20px;
            margin-top:28px;
          "
        >
          <p
            style="
              margin:0 0 8px;
              font-size:12px;
              line-height:1.6;
              color:#829297;
              text-align:center;
            "
          >
            Cette invitation expire dans
            <strong>7 jours</strong>.
          </p>

          <p
            style="
              margin:0;
              font-size:12px;
              line-height:1.6;
              color:#829297;
              text-align:center;
            "
          >
            Si vous n'êtes pas à l'origine de cette invitation,
            vous pouvez simplement ignorer cet email.
          </p>
        </div>
      `,
      {
        preheader: `${inviterName} vous invite à rejoindre la tontine ${tontineName}`,
      },
    );

    const text = `
AfriLinkPay

Vous êtes invité(e) à rejoindre une tontine !

${inviterName} vous invite à rejoindre la tontine "${tontineName}" sur AfriLinkPay.

Rejoignez cette tontine pour participer à un système d'épargne collaborative simple, transparent et sécurisé.

Accepter l'invitation :
${acceptUrl}

Cette invitation expire dans 7 jours.

Si vous n'êtes pas à l'origine de cette invitation, vous pouvez simplement ignorer cet email.

AfriLinkPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: `${inviterName} vous invite à rejoindre une tontine — AfriLinkPay`,
      html,
      text,
    });
  }

  // ============================================================
  // KYC - INFORMATIONS COMPLÉMENTAIRES
  // ============================================================

  async sendKycRequiresInfo(
    email: string,
    firstName: string,
    requestDetails?: string,
  ): Promise<void> {
    const safeFirstName = this.escapeHtml(firstName);

    const safeRequestDetails = requestDetails ? this.escapeHtml(requestDetails) : undefined;

    const detailsSection = safeRequestDetails
      ? `
        <div
          style="
            background:#fff8e8;
            border-left:4px solid #D28E2F;
            border-radius:8px;
            padding:16px;
            margin:24px 0;
          "
        >
          <strong style="color:#956313;">
            Informations demandées
          </strong>

          <p
            style="
              margin:8px 0 0;
              font-size:13px;
              line-height:1.6;
              color:#746346;
            "
          >
            ${safeRequestDetails}
          </p>
        </div>
      `
      : '';

    const html = this.buildTemplate(
      `
        <h1
          style="
            margin:0 0 16px;
            font-size:26px;
            color:#082B37;
          "
        >
          Informations complémentaires requises
        </h1>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Bonjour <strong>${safeFirstName}</strong>,
        </p>

        <p
          style="
            font-size:15px;
            line-height:1.7;
            color:#52666c;
          "
        >
          Nous avons besoin d'informations complémentaires
          pour poursuivre la vérification de votre identité.
        </p>

        ${detailsSection}

        <div
          style="
            background:#f4f7f6;
            border-radius:10px;
            padding:16px;
            margin-top:24px;
          "
        >
          <p
            style="
              margin:0;
              font-size:13px;
              line-height:1.6;
              color:#52666c;
            "
          >
            Connectez-vous à votre compte AfriLinkPay afin de
            compléter les informations demandées.
          </p>
        </div>
      `,
      {
        preheader: 'Des informations complémentaires sont nécessaires pour votre KYC',
      },
    );

    const text = `
AfriLinkPay

Bonjour ${firstName},

Nous avons besoin d'informations complémentaires pour poursuivre la vérification de votre identité.

${
  requestDetails
    ? `Informations demandées :
${requestDetails}

`
    : ''
}
Connectez-vous à votre compte AfriLinkPay afin de compléter les informations demandées.

AfriLinkPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Informations complémentaires requises — AfriLinkPay',
      html,
      text,
    });
  }
}
