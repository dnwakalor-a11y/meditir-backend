import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface EmailData {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WelcomeEmailData {
  hospitalName: string;
  adminName: string;
  adminEmail: string;
  subdomain: string;
  temporaryPassword: string;
  resetPasswordUrl: string;
}

export interface UserInviteEmailData {
  hospitalName: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  role: string;
  temporaryPassword: string;
  resetPasswordUrl: string;
  invitedByName: string;
}

export interface PasswordResetEmailData {
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  resetToken: string;
  resetPasswordUrl: string;
  hospitalName?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not found. Email service will not work.',
      );
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not initialized. Email not sent.');
      return;
    }

    try {
      const from =
        emailData.from ||
        this.configService.get<string>(
          'FROM_EMAIL',
          'noreply@notifications.meditir.com',
        );

      const response = await this.resend.emails.send({
        from,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      this.logger.log(`Email sent successfully: ${response.data?.id}`);
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendHospitalWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const html = this.generateHospitalWelcomeTemplate(data);
    const text = this.generateHospitalWelcomeText(data);

    await this.sendEmail({
      to: data.adminEmail,
      subject: `Welcome to Meditir - Your ${data.hospitalName} Admin Account is Ready`,
      html,
      text,
    });
  }

  async sendUserInviteEmail(data: UserInviteEmailData): Promise<void> {
    const html = this.generateUserInviteTemplate(data);
    const text = this.generateUserInviteText(data);

    await this.sendEmail({
      to: data.userEmail,
      subject: `You've been invited to join ${data.hospitalName} on Meditir`,
      html,
      text,
    });
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    this.logger.log(`Generating password reset email for ${data.userEmail} with token: ${data.resetToken.substring(0, 8)}... and URL: ${data.resetPasswordUrl}`);
    const html = this.generatePasswordResetTemplate(data);
    const text = this.generatePasswordResetText(data);

    const subject = data.hospitalName
      ? `Reset your password for ${data.hospitalName} on Meditir`
      : 'Reset your Meditir password';

    await this.sendEmail({
      to: data.userEmail,
      subject,
      html,
      text,
    });
  }

  private generateHospitalWelcomeTemplate(data: WelcomeEmailData): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Meditir</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8fffe;
                color: #333333;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
                letter-spacing: 1px;
            }
            .tagline {
                font-size: 16px;
                opacity: 0.9;
                margin: 0;
            }
            .content {
                padding: 40px 30px;
                line-height: 1.6;
            }
            .greeting {
                font-size: 24px;
                color: #059669;
                margin-bottom: 20px;
                font-weight: 600;
            }
            .credentials-box {
                background-color: #f0fdfa;
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                text-align: center;
            }
            .credentials-title {
                font-size: 18px;
                font-weight: 600;
                color: #059669;
                margin-bottom: 15px;
            }
            .credential-item {
                margin: 10px 0;
                font-size: 16px;
            }
            .credential-label {
                font-weight: 600;
                color: #374151;
            }
            .credential-value {
                font-family: monospace;
                background-color: #ffffff;
                padding: 5px 10px;
                border-radius: 4px;
                border: 1px solid #d1d5db;
                display: inline-block;
                margin-left: 10px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 25px 0;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .features {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
            }
            .features-title {
                font-size: 18px;
                font-weight: 600;
                color: #059669;
                margin-bottom: 15px;
            }
            .feature-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .feature-item {
                padding: 8px 0;
                color: #374151;
                position: relative;
                padding-left: 25px;
            }
            .feature-item::before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
                font-size: 16px;
            }
            .footer {
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            .footer-text {
                color: #6b7280;
                font-size: 14px;
                margin: 5px 0;
            }
            .security-note {
                background-color: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
                color: #92400e;
            }
            .security-note strong {
                color: #78350f;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">Meditir</div>
                <p class="tagline">Advanced Telehealth Platform</p>
            </div>
            
            <div class="content">
                <h1 class="greeting">Welcome to Meditir, ${data.adminName}!</h1>
                
                <p>Congratulations! Your hospital <strong>${data.hospitalName}</strong> has been successfully set up on the Meditir platform. You can now access your dedicated admin portal and start managing your telehealth operations.</p>
                
                <div class="credentials-box">
                    <div class="credentials-title">Your Login Credentials</div>
                    <div class="credential-item">
                        <span class="credential-label">Hospital Portal:</span>
                        <span class="credential-value">https://${data.subdomain}.meditir.com</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Email:</span>
                        <span class="credential-value">${data.adminEmail}</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Temporary Password:</span>
                        <span class="credential-value">${data.temporaryPassword}</span>
                    </div>
                </div>
                
                <div class="security-note">
                    <strong>Important Security Notice:</strong> Please reset your password immediately after your first login for security purposes.
                </div>
                
                <div style="text-align: center;">
                    <a href="${data.resetPasswordUrl}" class="cta-button">Set Your Password</a>
                </div>
                
                <div class="features">
                    <div class="features-title">What you can do with Meditir:</div>
                    <ul class="feature-list">
                        <li class="feature-item">Manage doctors, nurses, and patient accounts</li>
                        <li class="feature-item">Schedule and conduct video consultations</li>
                        <li class="feature-item">Access comprehensive patient records</li>
                        <li class="feature-item">Monitor hospital analytics and performance</li>
                        <li class="feature-item">Customize your hospital's branding</li>
                        <li class="feature-item">Integrate with existing hospital systems</li>
                    </ul>
                </div>
                
                <p>If you have any questions or need assistance getting started, our support team is here to help. Feel free to reach out at any time.</p>
                
                <p>Welcome aboard and thank you for choosing Meditir!</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>The Meditir Team</strong>
                </p>
            </div>
            
            <div class="footer">
                <p class="footer-text">© 2025 Meditir. All rights reserved.</p>
                <p class="footer-text">This email was sent to ${data.adminEmail}</p>
                <p class="footer-text">If you didn't expect this email, please contact our support team.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateHospitalWelcomeText(data: WelcomeEmailData): string {
    return `
Welcome to Meditir, ${data.adminName}!

Congratulations! Your hospital ${data.hospitalName} has been successfully set up on the Meditir platform.

Your Login Credentials:
- Hospital Portal: https://${data.subdomain}.meditir.com
- Email: ${data.adminEmail}
- Temporary Password: ${data.temporaryPassword}

IMPORTANT: Please reset your password immediately after your first login for security purposes.

Set Your Password: ${data.resetPasswordUrl}

What you can do with Meditir:
✓ Manage doctors, nurses, and patient accounts
✓ Schedule and conduct video consultations
✓ Access comprehensive patient records
✓ Monitor hospital analytics and performance
✓ Customize your hospital's branding
✓ Integrate with existing hospital systems

If you have any questions or need assistance getting started, our support team is here to help.

Best regards,
The Meditir Team

© 2025 Meditir. All rights reserved.
    `;
  }

  private generateUserInviteTemplate(data: UserInviteEmailData): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited to Join ${data.hospitalName}</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8fffe;
                color: #333333;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
                letter-spacing: 1px;
            }
            .tagline {
                font-size: 16px;
                opacity: 0.9;
                margin: 0;
            }
            .content {
                padding: 40px 30px;
                line-height: 1.6;
            }
            .greeting {
                font-size: 24px;
                color: #059669;
                margin-bottom: 20px;
                font-weight: 600;
            }
            .role-badge {
                display: inline-block;
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 14px;
                margin: 10px 0;
            }
            .credentials-box {
                background-color: #f0fdfa;
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                text-align: center;
            }
            .credentials-title {
                font-size: 18px;
                font-weight: 600;
                color: #059669;
                margin-bottom: 15px;
            }
            .credential-item {
                margin: 10px 0;
                font-size: 16px;
            }
            .credential-label {
                font-weight: 600;
                color: #374151;
            }
            .credential-value {
                font-family: monospace;
                background-color: #ffffff;
                padding: 5px 10px;
                border-radius: 4px;
                border: 1px solid #d1d5db;
                display: inline-block;
                margin-left: 10px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 25px 0;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .footer {
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            .footer-text {
                color: #6b7280;
                font-size: 14px;
                margin: 5px 0;
            }
            .security-note {
                background-color: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
                color: #92400e;
            }
            .invite-details {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">Meditir</div>
                <p class="tagline">Advanced Telehealth Platform</p>
            </div>
            
            <div class="content">
                <h1 class="greeting">You're Invited, ${data.userFirstName}!</h1>
                
                <p>${data.invitedByName} has invited you to join <strong>${data.hospitalName}</strong> on the Meditir telehealth platform.</p>
                
                <div class="invite-details">
                    <p><strong>Your Role:</strong> <span class="role-badge">${data.role}</span></p>
                    <p><strong>Hospital:</strong> ${data.hospitalName}</p>
                    <p><strong>Invited by:</strong> ${data.invitedByName}</p>
                </div>
                
                <div class="credentials-box">
                    <div class="credentials-title">Your Login Credentials</div>
                    <div class="credential-item">
                        <span class="credential-label">Email:</span>
                        <span class="credential-value">${data.userEmail}</span>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Temporary Password:</span>
                        <span class="credential-value">${data.temporaryPassword}</span>
                    </div>
                </div>
                
                <div class="security-note">
                    <strong>Important:</strong> Please set your own secure password after your first login.
                </div>
                
                <div style="text-align: center;">
                    <a href="${data.resetPasswordUrl}" class="cta-button">Accept Invitation & Set Password</a>
                </div>
                
                <p>As a <strong>${data.role}</strong> at ${data.hospitalName}, you'll have access to our comprehensive telehealth platform to provide excellent patient care.</p>
                
                <p>If you have any questions about your new role or need assistance getting started, please don't hesitate to reach out to your administrator or our support team.</p>
                
                <p style="margin-top: 30px;">
                    Welcome to the team!<br>
                    <strong>The Meditir Team</strong>
                </p>
            </div>
            
            <div class="footer">
                <p class="footer-text">© 2025 Meditir. All rights reserved.</p>
                <p class="footer-text">This invitation was sent to ${data.userEmail}</p>
                <p class="footer-text">If you didn't expect this invitation, please contact ${data.hospitalName} directly.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateUserInviteText(data: UserInviteEmailData): string {
    return `
You're Invited to Join ${data.hospitalName}!

Hello ${data.userFirstName},

${data.invitedByName} has invited you to join ${data.hospitalName} on the Meditir telehealth platform.

Your Details:
- Role: ${data.role}
- Hospital: ${data.hospitalName}
- Email: ${data.userEmail}
- Temporary Password: ${data.temporaryPassword}

IMPORTANT: Please set your own secure password after your first login.

Accept Invitation & Set Password: ${data.resetPasswordUrl}

As a ${data.role} at ${data.hospitalName}, you'll have access to our comprehensive telehealth platform to provide excellent patient care.

If you have any questions about your new role or need assistance getting started, please don't hesitate to reach out to your administrator or our support team.

Welcome to the team!
The Meditir Team

© 2025 Meditir. All rights reserved.
    `;
  }

  private generatePasswordResetTemplate(data: PasswordResetEmailData): string {
    this.logger.log(`Generating password reset template with data:`, {
      userEmail: data.userEmail,
      resetToken: data.resetToken ? `${data.resetToken.substring(0, 8)}...` : 'UNDEFINED',
      resetPasswordUrl: data.resetPasswordUrl,
      hospitalName: data.hospitalName
    });
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8fffe;
                color: #333333;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
                letter-spacing: 1px;
            }
            .tagline {
                font-size: 16px;
                opacity: 0.9;
                margin: 0;
            }
            .content {
                padding: 40px 30px;
                line-height: 1.6;
            }
            .greeting {
                font-size: 24px;
                color: #059669;
                margin-bottom: 20px;
                font-weight: 600;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 25px 0;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .footer {
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            .footer-text {
                color: #6b7280;
                font-size: 14px;
                margin: 5px 0;
            }
            .security-note {
                background-color: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
                color: #92400e;
            }
            .security-note strong {
                color: #78350f;
            }
            .token-box {
                background-color: #f0fdfa;
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
                font-family: monospace;
                font-size: 16px;
                font-weight: bold;
                color: #059669;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">Meditir</div>
                <p class="tagline">Advanced Telehealth Platform</p>
            </div>
            
            <div class="content">
                <h1 class="greeting">Password Reset Request</h1>
                
                <p>Hello ${data.userFirstName} ${data.userLastName},</p>
                
                <p>We received a request to reset your password for your Meditir account${data.hospitalName ? ` at ${data.hospitalName}` : ''}. If you made this request, please click the button below to reset your password.</p>
                
                <div style="text-align: center;">
                    <a href="${data.resetPasswordUrl}?token=${data.resetToken || 'MISSING_TOKEN'}" class="cta-button">Reset Your Password</a>
                </div>
                
                <p>Alternatively, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${data.resetPasswordUrl}?token=${data.resetToken || 'MISSING_TOKEN'}</p>
                
                <div class="security-note">
                    <strong>Security Notice:</strong> This password reset link will expire in 24 hours for your security. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                </div>
                
                <p>If you continue to have problems, please contact our support team for assistance.</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>The Meditir Team</strong>
                </p>
            </div>
            
            <div class="footer">
                <p class="footer-text">© 2025 Meditir. All rights reserved.</p>
                <p class="footer-text">This email was sent to ${data.userFirstName} ${data.userLastName}</p>
                <p class="footer-text">If you didn't request a password reset, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generatePasswordResetText(data: PasswordResetEmailData): string {
    return `
Password Reset Request

Hello ${data.userFirstName} ${data.userLastName},

We received a request to reset your password for your Meditir account${data.hospitalName ? ` at ${data.hospitalName}` : ''}.

Reset your password by visiting this link:
${data.resetPasswordUrl}?token=${data.resetToken || 'MISSING_TOKEN'}

SECURITY NOTICE: This password reset link will expire in 24 hours for your security. If you didn't request this password reset, please ignore this email and your password will remain unchanged.

If you continue to have problems, please contact our support team for assistance.

Best regards,
The Meditir Team

© 2025 Meditir. All rights reserved.
    `;
  }
}
