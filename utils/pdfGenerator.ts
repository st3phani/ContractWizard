// PDF Generator v1.1.0 - Enhanced Diacritics Support  
// Romanian Contract Management System
// Preserves Romanian diacritics with Arial font support

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
  // Better HTML to text conversion that preserves content
  let cleanText = htmlContent
    // First, extract and preserve text content from specific elements
    .replace(/<span[^>]*>(.*?)<\/span>/g, '$1') // Extract span content
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**') // Mark bold content
    .replace(/<p[^>]*style="[^"]*center[^"]*"[^>]*>(.*?)<\/p>/gi, '\n\n**CENTER**$1') // Mark centered content
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n') // Extract paragraph content
    .replace(/<br\s*\/?>/gi, '\n') // Convert breaks to newlines
    .replace(/<div[^>]*>(.*?)<\/div>/gi, '\n$1\n') // Extract div content
    .replace(/<table[^>]*>[\s\S]*?<\/table>/g, '') // Remove table elements
    .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
    // Clean up HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Fix Romanian diacritics and encoding issues
    .replace(/ă/g, 'ă')
    .replace(/â/g, 'â')
    .replace(/î/g, 'î')
    .replace(/ș/g, 'ș')
    .replace(/ț/g, 'ț')
    .replace(/Ă/g, 'Ă')
    .replace(/Â/g, 'Â')
    .replace(/Î/g, 'Î')
    .replace(/Ș/g, 'Ș')
    .replace(/Ț/g, 'Ț')
    // Clean up whitespace but preserve structure
    .replace(/[ \t]+/g, ' ') // Multiple spaces to single
    .replace(/\n[ \t]+/g, '\n') // Remove leading spaces on lines
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();

  return cleanText;
}

function fixRomanianChars(text: string): string {
  // Keep Romanian diacritics - modern PDF libraries support them properly
  // Only clean up any encoding artifacts that might cause issues
  return text
    .replace(/Ä‚/g, 'Ă')
    .replace(/Ä/g, 'Â') 
    .replace(/Ĺ/g, 'Î')
    .replace(/Ĺž/g, 'Ș')
    .replace(/Ĺ¢/g, 'Ț')
    .replace(/Ä\u0083/g, 'ă')
    .replace(/Ä\u0085/g, 'â')
    .replace(/Ä\u00ad/g, 'î')
    .replace(/Ĺ\u009f/g, 'ș')
    .replace(/Ĺ\u00a3/g, 'ț');
}

export function generatePDF(populatedContent: string, contract: ContractWithDetails): Buffer {
  const cleanText = htmlToText(populatedContent);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 25;
  const usableWidth = pageWidth - (2 * margin);
  
  // Use Arial font (same as editor and display)
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
      if (trimmedLine.includes('**CENTER**')) {
        const centerText = fixRomanianChars(trimmedLine.replace('**CENTER**', '').replace(/\*\*/g, '').trim());
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
      if (trimmedLine.includes('**')) {
        // For lines with bold text, we need to handle word wrapping more carefully
        const parts = trimmedLine.split('**');
        let currentLineParts: Array<{text: string, bold: boolean}> = [];
        
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            const isBold = i % 2 === 1;
            const words = parts[i].split(' ');
            
            for (const word of words) {
              const cleanWord = word.replace(/\*\*/g, ''); // Remove any remaining asterisks
              const testPart = { text: fixRomanianChars(cleanWord), bold: isBold };
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