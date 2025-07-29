import nodemailer from 'nodemailer';
import type { ContractWithDetails } from '@shared/schema';

// Email testing configuration
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // Fake SMTP for development - logs to console instead of sending real emails
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }
  
  // Production email configuration (when needed)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export interface EmailOptions {
  recipient: string;
  subject: string;
  message: string;
  attachPDF?: boolean;
  contract?: ContractWithDetails;
}

export async function sendContractEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'Contract Manager <noreply@contractmanager.ro>',
    to: options.recipient,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Contract pentru Semnare</h2>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${options.message.split('\n').map(line => `<p>${line}</p>`).join('')}
        </div>
        ${options.contract ? `
          <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">Detalii Contract</h3>
            <p><strong>Numărul contractului:</strong> ${options.contract.orderNumber}</p>
            <p><strong>Template:</strong> ${options.contract.template.name}</p>
            <p><strong>Beneficiar:</strong> ${options.contract.beneficiary.name}</p>
            <p><strong>Data creării:</strong> ${new Date(options.contract.createdAt || '').toLocaleDateString('ro-RO')}</p>
          </div>` : ''}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Acest email a fost trimis automat de sistemul Contract Manager.<br>
          Vă rugăm să nu răspundeți la acest email.
        </p>
      </div>
    `,
    text: options.message, // Fallback text version
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      // Log email details to console for development testing
      console.log('\n📧 =============== EMAIL SENT ===============');
      console.log('From:', mailOptions.from);
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Body Preview:', mailOptions.text?.substring(0, 100) + '...');
      console.log('Contract:', options.contract ? `#${options.contract.orderNumber} - ${options.contract.template.name}` : 'N/A');
      console.log('Timestamp:', new Date().toLocaleString('ro-RO'));
      console.log('==============================================\n');
      
      // In development, also store in a simple log file for viewing
      const fs = require('fs');
      const logEntry = {
        timestamp: new Date().toISOString(),
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        contract: options.contract ? {
          id: options.contract.id,
          orderNumber: options.contract.orderNumber,
          template: options.contract.template.name,
          beneficiary: options.contract.beneficiary.name
        } : null,
        message: mailOptions.text
      };
      
      const logFile = 'email-test-log.json';
      let logs = [];
      try {
        if (fs.existsSync(logFile)) {
          logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        }
      } catch (e) {
        logs = [];
      }
      
      logs.push(logEntry);
      // Keep only last 50 emails
      if (logs.length > 50) {
        logs = logs.slice(-50);
      }
      
      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    }
    
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Test email functionality
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email transporter is ready');
    return true;
  } catch (error) {
    console.error('Email transporter error:', error);
    return false;
  }
}