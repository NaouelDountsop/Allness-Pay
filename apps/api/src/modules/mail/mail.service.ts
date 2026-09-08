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
   * Template principal des emails AllnessPay.
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

  <title>AllnessPay</title>

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
                    <img
                      src="https://res.cloudinary.com/dnlnzgqzu/image/upload/v1754929257/afrilinkpay-logo-white_l7gx3o.png"
                      alt="AllnessPay"
                      height="34"
                      style="
                        display:inline-block;
                        height:34px;
                        margin-right:8px;
                        vertical-align:middle;
                      "
                    />

                    Allness
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
                Cet email a été envoyé automatiquement par AllnessPay.
              </p>

              <p
                style="
                  margin:0;
                  font-size:11px;
                  color:#8a999d;
                  text-align:center;
                "
              >
                © ${new Date().getFullYear()} AllnessPay.
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

  // ============================================================
  // COMPOSANTS EMAIL CENTRALISÉS
  // ============================================================

  /**
   * Titre principal (h1).
   */
  private heading(text: string, opts?: { align?: 'left' | 'center' }): string {
    const align = opts?.align ?? 'left';
    return `
      <h1
        style="
          margin:0 0 16px;
          font-size:26px;
          line-height:1.3;
          text-align:${align};
          color:#082B37;
        "
      >
        ${text}
      </h1>
    `;
  }

  /**
   * Paragraphe de corps.
   */
  private paragraph(
    text: string,
    opts?: { bold?: boolean; align?: 'left' | 'center'; mt?: number; mb?: number },
  ): string {
    const align = opts?.align ?? 'left';
    const mt = opts?.mt ?? 0;
    const mb = opts?.mb ?? 24;
    return `
      <p
        style="
          margin:${mt}px 0 ${mb}px;
          font-size:15px;
          line-height:1.7;
          text-align:${align};
          color:#52666c;
        "
      >
        ${text}
      </p>
    `;
  }

  /**
   * Paragraphe secondaire (plus petit, gris).
   */
  private smallText(
    text: string,
    opts?: { align?: 'left' | 'center'; mt?: number; mb?: number },
  ): string {
    const align = opts?.align ?? 'left';
    const mt = opts?.mt ?? 0;
    const mb = opts?.mb ?? 8;
    return `
      <p
        style="
          margin:${mt}px 0 ${mb}px;
          font-size:13px;
          line-height:1.6;
          color:#64777c;
          text-align:${align};
        "
      >
        ${text}
      </p>
    `;
  }

  /**
   * Boîte de statut colorée (gauche barrée).
   * type: 'success' | 'warning' | 'error' | 'info'
   */
  private statusBox(
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    description?: string,
  ): string {
    const colors = {
      success: { bg: '#eef8f4', border: '#1FAF74', title: '#08734b', text: '#527069' },
      warning: { bg: '#fff8e8', border: '#D28E2F', title: '#956313', text: '#746346' },
      error: { bg: '#fff5f5', border: '#dc2626', title: '#991b1b', text: '#7f1d1d' },
      info: { bg: '#f4f7f6', border: '#082B37', title: '#082B37', text: '#52666c' },
    };
    const c = colors[type];

    const descHtml = description
      ? `
        <p
          style="
            margin:8px 0 0;
            font-size:13px;
            line-height:1.6;
            color:${c.text};
          "
        >
          ${description}
        </p>
      `
      : '';

    return `
      <div
        style="
          background:${c.bg};
          border-left:4px solid ${c.border};
          border-radius:8px;
          padding:16px;
          margin:24px 0;
        "
      >
        <strong style="color:${c.title};">
          ${title}
        </strong>
        ${descHtml}
      </div>
    `;
  }

  /**
   * Boîte centrée avec label + valeur (pour les invitations tontine, résumés, etc.).
   */
  private infoCard(label: string, value: string): string {
    return `
      <div
        style="
          background:#f7faf9;
          border:1px solid #e3ebe8;
          border-radius:14px;
          padding:24px;
          margin:24px 0;
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
          ${label}
        </p>
        <p
          style="
            margin:0;
            font-size:21px;
            font-weight:700;
            color:#082B37;
          "
        >
          ${value}
        </p>
      </div>
    `;
  }

  /**
   * Bouton CTA centré.
   */
  private ctaButton(text: string, url: string): string {
    return `
      <div style="text-align:center; margin:30px 0;">
        <a
          href="${url}"
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
          ${text}
          <span style="color:#D28E2F;">→</span>
        </a>
      </div>
    `;
  }

  /**
   * Séparateur horizontal.
   */
  private divider(): string {
    return `
      <div
        style="
          border-top:1px solid #edf1f0;
          padding-top:20px;
          margin-top:28px;
        "
      ></div>
    `;
  }

  /**
   * Badge centré (ex: "INVITATION À UNE TONTINE").
   */
  private badge(text: string, color?: { bg?: string; fg?: string }): string {
    const bg = color?.bg ?? '#eef8f4';
    const fg = color?.fg ?? '#08734b';
    return `
      <div style="text-align:center; margin-bottom:28px;">
        <div
          style="
            display:inline-block;
            background:${bg};
            color:${fg};
            padding:8px 14px;
            border-radius:999px;
            font-size:12px;
            font-weight:700;
          "
        >
          ${text}
        </div>
      </div>
    `;
  }

  /**
   * Encart gris avec texte centré (ex: "Connectez-vous...").
   */
  private hintBox(text: string): string {
    return `
      <div
        style="
          background:#f4f7f6;
          border-radius:10px;
          padding:16px;
          margin:24px 0;
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
          ${text}
        </p>
      </div>
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
          name: 'AllnessPay',
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
        ${this.heading('Vérifiez votre adresse email')}

        ${this.paragraph(
          'Utilisez le code ci-dessous pour confirmer votre adresse email sur AllnessPay.',
        )}

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

        ${this.smallText('Ce code expire dans <strong>5 minutes</strong>.', { mb: 8 })}

        ${this.smallText('Ne partagez jamais ce code avec quelqu\'un d\'autre.', { mb: 0 })}
      `,
      {
        preheader: 'Votre code de vérification AllnessPay',
      },
    );

    const text = `
AllnessPay

Vérification de votre adresse email

Votre code de vérification est :

${otpCode}

Ce code expire dans 5 minutes.

Ne partagez jamais ce code avec quelqu'un d'autre.

AllnessPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Votre code de vérification AllnessPay',
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
        ${this.heading('Dossier KYC reçu')}

        ${this.paragraph(`Bonjour <strong>${safeFirstName}</strong>`)}

        ${this.paragraph(
          'Nous avons bien reçu votre dossier de vérification d\'identité.',
        )}

        ${this.statusBox(
          'success',
          'Statut : Dossier soumis',
          'Votre dossier est maintenant en attente de vérification par nos équipes.',
        )}

        ${this.smallText(
          'Vous recevrez une notification lorsque votre dossier aura été examiné.',
          { mb: 0 },
        )}
      `,
      {
        preheader: 'Votre dossier KYC a bien été reçu',
      },
    );

    const text = `
AllnessPay

Bonjour ${firstName},

Nous avons bien reçu votre dossier de vérification d'identité.

Statut : Dossier soumis.

Votre dossier est maintenant en attente de vérification par nos équipes.

Vous recevrez une notification lorsque votre dossier aura été examiné.

AllnessPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Votre dossier KYC a été reçu — AllnessPay',
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
        ${this.heading('Vérification en cours')}

        ${this.paragraph(`Bonjour <strong>${safeFirstName}</strong>`)}

        ${this.paragraph(
          'Votre dossier de vérification d\'identité est actuellement en cours d\'examen.',
        )}

        ${this.statusBox(
          'warning',
          'Statut : En cours de vérification',
          'Nos équipes analysent actuellement vos documents.',
        )}

        ${this.smallText(
          'Vous recevrez une nouvelle notification lorsque la vérification sera terminée.',
          { mb: 0 },
        )}
      `,
      {
        preheader: 'Votre vérification KYC est en cours',
      },
    );

    const text = `
AllnessPay

Bonjour ${firstName},

Votre dossier de vérification d'identité est actuellement en cours d'examen.

Statut : En cours de vérification.

Nos équipes analysent actuellement vos documents.

Vous recevrez une nouvelle notification lorsque la vérification sera terminée.

AllnessPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Votre vérification KYC est en cours — AllnessPay',
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
        ${this.heading('Vérification approuvée')}

        ${this.paragraph(`Bonjour <strong>${safeFirstName}</strong>`)}

        ${this.paragraph(
          'Excellente nouvelle ! Votre vérification d\'identité a été approuvée.',
        )}

        ${this.statusBox(
          'success',
          '✓ Compte vérifié',
          'Votre compte est maintenant entièrement vérifié.',
        )}

        ${this.smallText(
          'Vous pouvez maintenant accéder aux fonctionnalités disponibles sur AllnessPay.',
          { mb: 0 },
        )}
      `,
      {
        preheader: "Votre vérification d'identité a été approuvée",
      },
    );

    const text = `
AllnessPay

Bonjour ${firstName},

Excellente nouvelle ! Votre vérification d'identité a été approuvée.

Statut : Compte vérifié.

Votre compte est maintenant entièrement vérifié.

Vous pouvez maintenant accéder aux fonctionnalités disponibles sur AllnessPay.

AllnessPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Votre compte est vérifié — AllnessPay',
      html,
      text,
    });
  }

  // ============================================================
  // DÉPÔT - NOTIFICATION
  // ============================================================

  async sendDepositNotification(
    email: string,
    firstName: string | undefined,
    options: { amount: number; currency: string; reference: string; walletNumber: string; newBalance?: string },
  ): Promise<void> {
    const safeName = firstName ? this.escapeHtml(firstName) : 'Client';
    const safeAmount = this.escapeHtml(String(options.amount));
    const safeCurrency = this.escapeHtml(options.currency);
    const safeReference = this.escapeHtml(options.reference);
    const safeWallet = this.escapeHtml(options.walletNumber);

    const html = this.buildTemplate(
      `
        ${this.heading('Dépôt crédité sur votre portefeuille')}

        ${this.paragraph(`Bonjour <strong>${safeName}</strong>,`)}

        ${this.paragraph(
          `Nous avons crédité ${safeAmount} ${safeCurrency} sur votre portefeuille ${safeWallet}.`,
        )}

        ${this.infoCard('Référence', safeReference)}

        ${this.paragraph('Si vous n’avez pas réalisé cette opération, contactez notre support immédiatement.')}
      `,
      { preheader: 'Votre dépôt a été crédité' },
    );

    const text = `AllnessPay\n\nBonjour ${firstName || 'client'},\n\nNous avons crédité ${options.amount} ${options.currency} sur votre portefeuille ${options.walletNumber}.\n\nRéférence: ${options.reference}\n\nSi vous n'avez pas réalisé cette opération, contactez notre support.`;

    await this.sendMail({
      to: email,
      subject: 'Dépôt crédité — AllnessPay',
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

    const html = this.buildTemplate(
      `
        ${this.heading('Vérification KYC non approuvée')}

        ${this.paragraph(`Bonjour <strong>${safeFirstName}</strong>`)}

        ${this.paragraph(
          'Votre dossier de vérification d\'identité n\'a pas pu être validé.',
        )}

        ${safeReason
          ? this.statusBox('error', 'Motif du refus', safeReason)
          : ''}

        ${this.smallText(
          'Vous pouvez soumettre un nouveau dossier en corrigeant les éléments demandés.',
          { mb: 0 },
        )}
      `,
      {
        preheader: 'Une action est nécessaire concernant votre KYC',
      },
    );

    const text = `
AllnessPay

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

AllnessPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Action requise concernant votre KYC — AllnessPay',
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
    _token: string,
  ): Promise<void> {
    const safeInviterName = this.escapeHtml(inviterName);
    const safeTontineName = this.escapeHtml(tontineName);
    const appUrl = this.frontendUrl;

    const html = this.buildTemplate(
      `
        ${this.badge('INVITATION À UNE TONTINE')}

        ${this.heading('Vous êtes invité(e) !', { align: 'center' })}

        ${this.paragraph(
          `<strong>${safeInviterName}</strong> vous invite à rejoindre une tontine sur <strong>AllnessPay</strong>.`,
          { align: 'center' },
        )}

        ${this.infoCard('Tontine', safeTontineName)}

        ${this.paragraph(
          'Connectez-vous ou inscrivez-vous sur AllnessPay pour voir et accepter cette invitation.',
          { align: 'center', mb: 0 },
        )}

        ${this.ctaButton('Ouvrir AllnessPay', appUrl)}

        ${this.divider()}

        ${this.smallText(
          'Cette invitation expire dans <strong>7 jours</strong>.',
          { align: 'center', mb: 8 },
        )}

        ${this.smallText(
          'Si vous n\'êtes pas à l\'origine de cette invitation, vous pouvez simplement ignorer cet email.',
          { align: 'center', mb: 0 },
        )}
      `,
      {
        preheader: `${inviterName} vous invite à rejoindre la tontine ${tontineName}`,
      },
    );

    const text = `
AllnessPay

Vous êtes invité(e) à rejoindre une tontine !

${inviterName} vous invite à rejoindre la tontine "${tontineName}" sur AllnessPay.

Connectez-vous ou inscrivez-vous sur AllnessPay pour voir et accepter cette invitation.

Ouvrir AllnessPay :
${appUrl}

Cette invitation expire dans 7 jours.

Si vous n'êtes pas à l'origine de cette invitation, vous pouvez simplement ignorer cet email.

AllnessPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: `${inviterName} vous invite à rejoindre une tontine — AllnessPay`,
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

    const html = this.buildTemplate(
      `
        ${this.heading('Informations complémentaires requises')}

        ${this.paragraph(`Bonjour <strong>${safeFirstName}</strong>`)}

        ${this.paragraph(
          'Nous avons besoin d\'informations complémentaires pour poursuivre la vérification de votre identité.',
        )}

        ${safeRequestDetails
          ? this.statusBox('warning', 'Informations demandées', safeRequestDetails)
          : ''}

        ${this.hintBox(
          'Connectez-vous à votre compte AllnessPay afin de compléter les informations demandées.',
        )}
      `,
      {
        preheader: 'Des informations complémentaires sont nécessaires pour votre KYC',
      },
    );

    const text = `
AllnessPay

Bonjour ${firstName},

Nous avons besoin d'informations complémentaires pour poursuivre la vérification de votre identité.

${
  requestDetails
    ? `Informations demandées :
${requestDetails}

`
    : ''
}
Connectez-vous à votre compte AllnessPay afin de compléter les informations demandées.

AllnessPay
    `.trim();

    await this.sendMail({
      to: email,
      subject: 'Informations complémentaires requises — AllnessPay',
      html,
      text,
    });
  }
}
