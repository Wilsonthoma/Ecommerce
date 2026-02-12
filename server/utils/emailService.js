import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getTemplate } from './emailTemplates.js';

dotenv.config();

// -------------------- CONFIGURATION --------------------
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
    ciphers: 'SSLv3'
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5
};

// -------------------- TRANSPORTER --------------------
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// -------------------- EMAIL SENDING SERVICE --------------------
export class EmailService {
  constructor() {
    this.transporter = transporter;
    this.defaultFrom = `"${process.env.COMPANY_NAME || 'KwetuShop'}" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`;
    this.companyName = process.env.COMPANY_NAME || 'KwetuShop';
  }

  /**
   * Check SMTP connection - FIX: Renamed from checkConnection to verifyConnection
   * to match server.js health check requirement.
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Email Service Verification Failed:', error.message);
      return false;
    }
  }

  /**
   * Send an email with template
   */
  async sendTemplateEmail(options) {
    const { to, template, data, subject, from } = options;
    
    try {
      const html = getTemplate(template, {
        ...data,
        companyName: this.companyName,
        currentYear: new Date().getFullYear(),
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        adminUrl: process.env.ADMIN_URL || 'http://localhost:5174'
      });

      const defaultSubjects = {
        'email-verify': `Verify Your Email - ${this.companyName}`,
        'password-reset': `Password Reset - ${this.companyName}`,
        'verification-success': `Email Verified - ${this.companyName}`,
        'password-reset-success': `Password Updated - ${this.companyName}`,
        'welcome': `Welcome to ${this.companyName}!`,
        'order-confirmation': `Order Confirmation - ${this.companyName}`
      };

      const emailSubject = subject || defaultSubjects[template] || `Message from ${this.companyName}`;
      
      const mailOptions = {
        from: from || this.defaultFrom,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: emailSubject,
        text: this.generatePlainText(html),
        html,
        headers: {
          'X-Priority': '1',
          'Importance': 'high'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a custom email without template
   */
  async sendCustomEmail(options) {
    const { to, subject, text, html, from, attachments } = options;
    
    try {
      const mailOptions = {
        from: from || this.defaultFrom,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject || `Message from ${this.companyName}`,
        text: text || '',
        html: html || text || '',
        attachments: attachments || []
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error('❌ Custom email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  generatePlainText(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  getStats() {
    return { service: 'nodemailer', transport: SMTP_CONFIG.host };
  }
}

// -------------------- INSTANCE & EXPORTS --------------------
const emailService = new EmailService();

// Export as individual functions for controllers
export const sendEmail = (options) => emailService.sendCustomEmail(options);
export const sendTemplateEmail = (options) => emailService.sendTemplateEmail(options);
export const verifyConnection = () => emailService.verifyConnection(); // FIX: Added this export
export const getEmailStats = () => emailService.getStats();

// Export as default instance for server.js
export default emailService;