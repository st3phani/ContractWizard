import fs from 'fs';
import path from 'path';

export interface EmailLogEntry {
  timestamp: string;
  from: string;
  to: string;
  subject: string;
  contract?: {
    id: number;
    orderNumber: number;
    template: string;
    beneficiary: string;
  };
  message: string;
}

const EMAIL_LOG_FILE = path.join(process.cwd(), 'email-test-log.json');

export function getEmailLogs(): EmailLogEntry[] {
  try {
    if (fs.existsSync(EMAIL_LOG_FILE)) {
      const data = fs.readFileSync(EMAIL_LOG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading email logs:', error);
  }
  return [];
}

export function clearEmailLogs(): void {
  try {
    if (fs.existsSync(EMAIL_LOG_FILE)) {
      fs.unlinkSync(EMAIL_LOG_FILE);
    }
  } catch (error) {
    console.error('Error clearing email logs:', error);
  }
}

export function getLatestEmails(count: number = 10): EmailLogEntry[] {
  const logs = getEmailLogs();
  return logs.slice(-count).reverse(); // Get latest emails first
}