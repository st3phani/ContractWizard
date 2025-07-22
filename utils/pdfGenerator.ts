// PDF Generator v1.0.0 - Production Ready
// Romanian Contract Management System
// Complete PDF generation with character encoding fixes

import { jsPDF } from 'jspdf';
import type { ContractWithDetails } from '../shared/schema';

interface PDFGenerationData {
  orderNumber: number | string;
  currentDate: string;
  beneficiary: {
    name: string;
    email: string;
    phone: string;
    address: string;
    cnp?: string;
    companyName?: string;
    companyAddress?: string;
    companyCui?: string;
    companyRegistrationNumber?: string;
    companyLegalRepresentative?: string;
    isCompany: boolean;
  };
  contract: {
    startDate: string;
    endDate: string;
    value: string;
    currency: string;
    notes: string;
  };
  provider: {
    name: string;
    address: string;
    phone: string;
    email: string;
    cui: string;
    registrationNumber: string;
    legalRepresentative: string;
  };
}

export function populateTemplate(template: string, data: PDFGenerationData): string {
  let result = template;
  
  // Replace all variables with actual data
  const replacements = {
    '{{orderNumber}}': data.orderNumber,
    '{{currentDate}}': data.currentDate,
    '{{beneficiary.name}}': data.beneficiary.name,
    '{{beneficiary.email}}': data.beneficiary.email,
    '{{beneficiary.phone}}': data.beneficiary.phone,
    '{{beneficiary.address}}': data.beneficiary.address,
    '{{beneficiary.cnp}}': data.beneficiary.cnp || '',
    '{{beneficiary.companyName}}': data.beneficiary.companyName || '',
    '{{beneficiary.companyAddress}}': data.beneficiary.companyAddress || '',
    '{{beneficiary.companyCui}}': data.beneficiary.companyCui || '',
    '{{beneficiary.companyRegistrationNumber}}': data.beneficiary.companyRegistrationNumber || '',
    '{{beneficiary.companyLegalRepresentative}}': data.beneficiary.companyLegalRepresentative || '',
    '{{contract.startDate}}': data.contract.startDate,
    '{{contract.endDate}}': data.contract.endDate,
    '{{contract.value}}': data.contract.value,
    '{{contract.currency}}': data.contract.currency,
    '{{contract.notes}}': data.contract.notes,
    '{{provider.name}}': data.provider.name,
    '{{provider.address}}': data.provider.address,
    '{{provider.phone}}': data.provider.phone,
    '{{provider.email}}': data.provider.email,
    '{{provider.cui}}': data.provider.cui,
    '{{provider.registrationNumber}}': data.provider.registrationNumber,
    '{{provider.legalRepresentative}}': data.provider.legalRepresentative,
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
  }

  return result;
}

export function htmlToText(htmlContent: string): string {
  // Convert HTML to clean text with simplified processing
  let cleanText = htmlContent
    // Process centered paragraphs first
    .replace(/<p[^>]*style="[^"]*center[^"]*"[^>]*>(.*?)<\/p>/gi, '\n\nCENTER:$1')
    // Process all other paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
    // Handle line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove table elements completely
    .replace(/<table[^>]*>[\s\S]*?<\/table>/g, '')
    // Mark bold content for later processing
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, 'BOLD:$1:BOLD')
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Remove all asterisks completely
    .replace(/\*/g, '')
    // Clean up whitespace but preserve structure
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleanText;
}

function fixRomanianChars(text: string): string {
  // Replace problematic Romanian characters with proper ones for PDF
  return text
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/Ă/g, 'A')
    .replace(/Â/g, 'A')
    .replace(/Î/g, 'I')
    .replace(/Ș/g, 'S')
    .replace(/Ț/g, 'T');
}

export function generatePDF(populatedContent: string, contract: ContractWithDetails): Buffer {
  const cleanText = htmlToText(populatedContent);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 25;
  const usableWidth = pageWidth - (2 * margin);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  
  let y = margin + 10;
  const lineHeight = 6;
  
  // Split content into paragraphs and process each
  const paragraphs = cleanText.split('\n\n').filter(p => p.trim());
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    
    if (!trimmedParagraph) continue;
    
    // Split long paragraphs into lines for better formatting
    const lines = trimmedParagraph.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
    
      // Check if we need a new page
      if (y > pageHeight - 30) {
        pdf.addPage();
        y = margin + 10;
      }
    
      // Handle centered content
      if (trimmedLine.startsWith('CENTER:')) {
        const centerText = fixRomanianChars(trimmedLine.replace('CENTER:', '').trim());
        if (centerText) {
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text(centerText, pageWidth / 2, y, { align: 'center' });
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          y += lineHeight + 5;
        }
        continue;
      }
      
      // Handle articles with extra spacing
      if (trimmedLine.startsWith('Art.')) {
        y += 3;
      }
      
      // Process text with proper word wrapping (handle both bold and regular text)
      if (trimmedLine.includes('BOLD:')) {
        // For lines with bold text, we need to handle word wrapping more carefully
        const parts = trimmedLine.split(/BOLD:|:BOLD/);
        let currentLineParts: Array<{text: string, bold: boolean}> = [];
        
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            const isBold = i % 2 === 1;
            const words = parts[i].split(' ');
            
            for (const word of words) {
              const testPart = { text: fixRomanianChars(word), bold: isBold };
              const testLine = currentLineParts.concat([testPart]);
              
              // Calculate width of test line
              let testWidth = 0;
              for (const part of testLine) {
                pdf.setFont('helvetica', part.bold ? 'bold' : 'normal');
                testWidth += pdf.getTextWidth(part.text + ' ');
              }
              
              if (testWidth > usableWidth && currentLineParts.length > 0) {
                // Render current line
                let x = margin;
                for (const part of currentLineParts) {
                  pdf.setFont('helvetica', part.bold ? 'bold' : 'normal');
                  pdf.text(part.text, x, y);
                  x += pdf.getTextWidth(part.text + ' ');
                }
                y += lineHeight;
                
                if (y > pageHeight - 30) {
                  pdf.addPage();
                  y = margin + 10;
                }
                
                currentLineParts = [testPart];
              } else {
                currentLineParts.push(testPart);
              }
            }
          }
        }
        
        // Render remaining parts
        if (currentLineParts.length > 0) {
          let x = margin;
          for (const part of currentLineParts) {
            pdf.setFont('helvetica', part.bold ? 'bold' : 'normal');
            pdf.text(part.text, x, y);
            x += pdf.getTextWidth(part.text + ' ');
          }
          y += lineHeight;
        }
        
        pdf.setFont('helvetica', 'normal');
      } else {
        // Regular text with simple word wrapping
        const words = trimmedLine.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const cleanWord = fixRomanianChars(word);
          const testLine = currentLine + (currentLine ? ' ' : '') + cleanWord;
          const textWidth = pdf.getTextWidth(testLine);
          
          if (textWidth > usableWidth && currentLine) {
            pdf.text(currentLine, margin, y);
            y += lineHeight;
            currentLine = cleanWord;
            
            if (y > pageHeight - 30) {
              pdf.addPage();
              y = margin + 10;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          pdf.text(currentLine, margin, y);
          y += lineHeight;
        }
      }
      
      // Extra spacing after articles
      if (trimmedLine.startsWith('Art.')) {
        y += 2;
      }
    }
    
    // Add spacing between paragraphs
    y += 3;
  }
  
  // Add signatures
  if (y > pageHeight - 50) {
    pdf.addPage();
    y = margin + 20;
  } else {
    y += 20;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRESTATOR', margin, y);
  pdf.text('BENEFICIAR', margin + 90, y);
  
  y += 15;
  pdf.setFont('helvetica', 'normal');
  pdf.text('_________________', margin, y);
  pdf.text('_________________', margin + 90, y);
  
  return Buffer.from(pdf.output('arraybuffer'));
}