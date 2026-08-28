import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Mock mail sender. Uses nodemailer's JSON transport, which never opens a
 * network connection — it only serializes what *would* be sent. The
 * assessment brief explicitly allows a mock email implementation, so
 * outgoing mail is logged instead of delivered.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter = nodemailer.createTransport({
    jsonTransport: true,
  });

  async sendPasswordReset(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await this.send({
      to,
      subject: 'Reset your password',
      text: `Use this link to reset your password (expires in 1 hour): ${resetUrl}`,
      html: `<p>Use this link to reset your password (expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }

  private async send(message: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    const info = await this.transporter.sendMail({
      from: 'no-reply@snec-taskmanager.local',
      ...message,
    });
    this.logger.log(`Mock email -> ${message.to}: "${message.subject}" ${info.messageId}`);
  }
}
