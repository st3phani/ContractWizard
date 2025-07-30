import nodemailer from 'nodemailer';
import type { ContractWithDetails } from '@shared/schema';

interface EmailOptions {
  to: string;
  subject: string;
  message: string;
  contract?: ContractWithDetails;
}

interface SignedContractEmailOptions {
  contract: ContractWithDetails;
  recipientType: 'partenery' | 'administrator';
  adminEmail?: string;
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
    console.log('Signing Link:', options.contract?.signingToken ? `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/sign-contract/${options.contract.signingToken}` : 'No signing token');
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
            <p><strong>Partener:</strong> ${options.contract.partenery.name}</p>
            <p><strong>Data creării:</strong> ${new Date(options.contract.createdAt || '').toLocaleDateString('ro-RO')}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Semnare Contract</h3>
            <p style="margin: 0 0 15px 0; color: #374151;">Pentru a semna contractul, accesați link-ul de mai jos:</p>
            <a href="https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/sign-contract/${options.contract.signingToken}" 
               style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Semnează Contractul
            </a>
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

export async function sendSignedContractNotification(options: SignedContractEmailOptions): Promise<void> {
  const { contract, recipientType, adminEmail } = options;
  
  // Safety check for contract structure
  if (!contract || !contract.partenery) {
    console.error('❌ Invalid contract structure for email notification:', contract);
    throw new Error('Contract or partenery data is missing');
  }
  
  const recipientEmail = recipientType === 'partenery' 
    ? contract.partenery.email 
    : (adminEmail || 'admin@contractmanager.ro');
    
  const subject = recipientType === 'partenery' 
    ? `Contract #${contract.orderNumber} - Confirmare Semnare`
    : `Contract #${contract.orderNumber} - Notificare Semnare`;
    
  const isForPartenery = recipientType === 'partenery';
  
  // Simple console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 =============== SIGNED CONTRACT EMAIL ===============');
    console.log('From: Contract Manager <noreply@contractmanager.ro>');
    console.log('To:', recipientEmail);
    console.log('Subject:', subject);
    console.log('Recipient Type:', recipientType);
    console.log('Contract Details:');
    console.log(`  - Numărul contractului: ${contract.orderNumber}`);
    console.log(`  - Template: ${contract.template?.name || 'N/A'}`);
    console.log(`  - Partener: ${contract.partenery.name}`);
    console.log(`  - Email partener: ${contract.partenery.email}`);
    console.log(`  - Data creării: ${contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('ro-RO') : 'N/A'}`);
    console.log(`  - Semnat de: ${contract.signedBy || 'N/A'}`);
    console.log(`  - Data semnării: ${contract.signedAt ? new Date(contract.signedAt).toLocaleDateString('ro-RO') : 'N/A'}`);
    console.log(`  - IP semnare: ${contract.signedIp || 'N/A'}`);
    console.log(`  - Token semnat: ${contract.signedToken || 'N/A'}`);
    console.log(`  - Status: ${contract.status?.statusLabel || 'N/A'}`);
    if (contract.signedToken) {
      console.log(`  - Link contract semnat: https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/signed-contract/${contract.signedToken}`);
    }
    console.log('Timestamp:', new Date().toLocaleString('ro-RO'));
    console.log('====================================================\n');
    
    return Promise.resolve();
  }

  // Real email implementation for production
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="background-color: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Contract Manager</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0;">
          ${isForPartenery ? 'Confirmare Semnare Contract' : 'Notificare Semnare Contract'}
        </h2>
        
        <div style="background-color: #10b981; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
          <h3 style="margin: 0; font-size: 18px;">✓ Contract Semnat cu Succes</h3>
        </div>
        
        <div style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          ${isForPartenery 
            ? `Contractul dumneavoastră a fost semnat cu succes. Vă mulțumim pentru colaborare!`
            : `Un contract a fost semnat în sistem de către partener.`
          }
        </div>
        
        <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin: 20px 0; background-color: #f9fafb;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Detalii Contract</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 40%;">Numărul contractului:</td>
              <td style="padding: 8px 0;">${contract.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Template:</td>
              <td style="padding: 8px 0;">${contract.template?.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Partener:</td>
              <td style="padding: 8px 0;">${contract.partenery.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email partener:</td>
              <td style="padding: 8px 0;">${contract.partenery.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Data creării:</td>
              <td style="padding: 8px 0;">${contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('ro-RO') : 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div style="border: 1px solid #10b981; padding: 20px; border-radius: 6px; margin: 20px 0; background-color: #f0fdf4;">
          <h3 style="margin: 0 0 15px 0; color: #059669;">Detalii Semnare</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 40%;">Semnat de:</td>
              <td style="padding: 8px 0;">${contract.signedBy || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Data semnării:</td>
              <td style="padding: 8px 0;">${contract.signedAt ? new Date(contract.signedAt).toLocaleDateString('ro-RO') + ' ' + new Date(contract.signedAt).toLocaleTimeString('ro-RO') : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Adresa IP:</td>
              <td style="padding: 8px 0;">${contract.signedIp || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0;"><span style="background-color: #10b981; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px;">${contract.status?.statusLabel || 'Semnat'}</span></td>
            </tr>
            ${contract.signedToken ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Token contract:</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${contract.signedToken}</td>
            </tr>` : ''}
          </table>
        </div>
        
        ${contract.signedToken ? `
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937;">Acces Contract Semnat</h3>
          <p style="margin: 0 0 15px 0; color: #374151;">Pentru a accesa contractul semnat, folosiți link-ul de mai jos:</p>
          <a href="https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/signed-contract/${contract.signedToken}" 
             style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Vezi Contractul Semnat
          </a>
        </div>` : ''}
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Acest email a fost trimis automat de sistemul Contract Manager.<br>
          ${isForPartenery ? 'Vă mulțumim pentru colaborare!' : 'Notificare automată pentru administrator.'}
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: 'Contract Manager <noreply@contractmanager.ro>',
    to: recipientEmail,
    subject: subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  console.log('Production signed contract email sent successfully');
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