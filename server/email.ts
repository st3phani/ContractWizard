import nodemailer from 'nodemailer';
import type { ContractWithDetails } from '@shared/schema';

interface EmailOptions {
  to: string;
  subject: string;
  message: string;
  contract?: ContractWithDetails;
}

export async function sendContractEmail(options: EmailOptions): Promise<void> {
  // Simple console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 =============== EMAIL SENT ===============');
    console.log('From: Contract Manager <noreply@contractmanager.ro>');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Message:', options.message);
    console.log('Contract:', options.contract ? `#${options.contract.orderNumber} - ${options.contract.template.name}` : 'N/A');
    console.log('Timestamp:', new Date().toLocaleString('ro-RO'));
    console.log('==============================================\n');
    
    // Simulate successful send in development
    return Promise.resolve();
  }

  // Real email implementation for production
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: 'Contract Manager <noreply@contractmanager.ro>',
    to: options.to,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background-color: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Contract Manager</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Contract pentru semnare</h2>
          <div style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            ${options.message}
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
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
  console.log('Production email sent successfully');
}

// Test email functionality
export async function testEmailConnection(): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Email system ready (Development Mode - Console Logging)');
      return true;
    }
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    await transporter.verify();
    console.log('Production email transporter is ready');
    return true;
  } catch (error) {
    console.error('Email connection error:', error);
    return false;
  }
}