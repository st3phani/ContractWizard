// PDF Generator v1.0.9 - Production Stable
// Romanian Contract Management System  
// Standardized Arial font family with consistent formatting across all outputs

import { jsPDF } from 'jspdf';
import type { ContractWithDetails } from '../shared/schema';

interface PDFGenerationData {
  orderNumber: number | string;
  currentDate: string;
  partenery: {
    name: string;
    email: string;
    phone: string;
    address: string;
    cnp?: string;
    companyName?: string;
    companyAddress?: string;
    companyCui?: string;
    companyRegistrationNumber?: string;

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
  
  // Handle conditional logic first
  const processConditionals = (text: string, isCompany: boolean): string => {
    // Remove {{#if isCompany}} blocks if not a company
    if (!isCompany) {
      text = text.replace(/\{\{#if isCompany\}\}([\s\S]*?)\{\{\/if\}\}/g, '');
    } else {
      // Keep content inside {{#if isCompany}} blocks and remove the tags
      text = text.replace(/\{\{#if isCompany\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
    }
    
    // Remove {{#if isIndividual}} blocks if company
    if (isCompany) {
      text = text.replace(/\{\{#if isIndividual\}\}([\s\S]*?)\{\{\/if\}\}/g, '');
    } else {
      // Keep content inside {{#if isIndividual}} blocks and remove the tags
      text = text.replace(/\{\{#if isIndividual\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
    }
    
    // Handle {{#unless}} blocks
    text = text.replace(/\{\{#unless isCompany\}\}([\s\S]*?)\{\{\/unless\}\}/g, isCompany ? '' : '$1');
    text = text.replace(/\{\{#unless isIndividual\}\}([\s\S]*?)\{\{\/unless\}\}/g, !isCompany ? '' : '$1');
    
    // Clean up any remaining conditional tags that might be malformed
    text = text.replace(/\{\{#if\s+\w+\}\}/g, '');
    text = text.replace(/\{\{\/if\}\}/g, '');
    text = text.replace(/\{\{#unless\s+\w+\}\}/g, '');
    text = text.replace(/\{\{\/unless\}\}/g, '');
    
    return text;
  };

  // Process conditionals based on partenery type
  const isCompany = data.partenery.isCompany || false;
  result = processConditionals(result, isCompany);
  
  // Replace all variables with actual data
  const replacements = {
    '{{orderNumber}}': data.orderNumber,
    '{{currentDate}}': data.currentDate,
    '{{partenery.name}}': data.partenery.name,
    '{{partenery.email}}': data.partenery.email,
    '{{partenery.phone}}': data.partenery.phone,
    '{{partenery.address}}': data.partenery.address,
    '{{partenery.cnp}}': data.partenery.cnp || '',
    '{{partenery.companyName}}': data.partenery.companyName || '',
    '{{partenery.companyAddress}}': data.partenery.companyAddress || '',
    '{{partenery.companyCui}}': data.partenery.companyCui || '',
    '{{partenery.companyRegistrationNumber}}': data.partenery.companyRegistrationNumber || '',
    '{{partenery.companyLegalRepresentative}}': data.partenery.name || '',
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
  if (y > pageHeight - 80) {
    pdf.addPage();
    y = margin + 20;
  } else {
    y += 20;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRESTATOR', margin, y);
  pdf.text('BENEFICIAR', margin + 90, y);
  
  y += 10;
  pdf.setFont('helvetica', 'normal');
  
  // Check if contract is signed and add digital signatures
  if (contract.status?.statusCode === 'signed' && contract.signedAt && contract.signedBy) {
    // Add signature boxes with padding (10px = ~3.5mm)
    const boxPadding = 3.5;
    const boxWidth = 80;
    const boxHeight = 25;
    
    // Prestator signature box with orange-red border
    pdf.setDrawColor(255, 102, 51); // Orange-red color (RGB: 255, 102, 51)
    pdf.setLineWidth(0.5);
    pdf.rect(margin - boxPadding, y - boxPadding, boxWidth, boxHeight);
    
    // Add signature icon in blue color (same as Contract Nou button - bg-blue-600)
    pdf.setDrawColor(37, 99, 235); // Blue color (RGB: 37, 99, 235 - blue-600)
    pdf.setLineWidth(1.2);
    const prestatorSignX = margin + boxWidth - 30; // Right side positioning
    pdf.line(prestatorSignX, y + 2, prestatorSignX + 20, y + 4); // Signature line 1
    pdf.line(prestatorSignX + 5, y + 4, prestatorSignX + 25, y + 6); // Signature line 2
    pdf.line(prestatorSignX + 10, y + 6, prestatorSignX + 18, y + 8); // Signature line 3
    
    y += 3;
    pdf.setFontSize(9);
    pdf.text(contract.provider?.name || 'N/A', margin, y);
    y += 4;
    pdf.text(contract.provider?.legalRepresentative || 'N/A', margin, y);
    y += 4;
    pdf.text(new Date(contract.signedAt).toLocaleString('ro-RO', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }), margin, y);
    y += 4;
    pdf.setFontSize(7);
    pdf.text(`Token: ${contract.signingToken || 'N/A'}`, margin, y);
    
    // Reset y for partenery signature  
    y -= 15;
    
    // Beneficiar signature box with orange-red border
    pdf.setDrawColor(255, 102, 51); // Orange-red color (RGB: 255, 102, 51)
    pdf.setLineWidth(0.5);
    pdf.rect(margin + 90 - boxPadding, y - boxPadding, boxWidth, boxHeight);
    
    // Add signature icon for partenery in blue color
    pdf.setDrawColor(37, 99, 235); // Blue color (RGB: 37, 99, 235 - blue-600)
    pdf.setLineWidth(1.2);
    const partenerySignX = margin + 90 + boxWidth - 30; // Right side positioning
    pdf.line(partenerySignX, y + 2, partenerySignX + 20, y + 4); // Signature line 1
    pdf.line(partenerySignX + 5, y + 4, partenerySignX + 25, y + 6); // Signature line 2
    pdf.line(partenerySignX + 10, y + 6, partenerySignX + 18, y + 8); // Signature line 3
    
    // Reset colors and line width
    pdf.setDrawColor(0, 0, 0); // Black
    pdf.setLineWidth(0.2);
    
    y += 3;
    pdf.setFontSize(9);
    const parteneryName = contract.beneficiary?.isCompany ? 
      contract.beneficiary?.companyName : 
      contract.beneficiary?.name;
    
    pdf.text(parteneryName || 'N/A', margin + 90, y);
    y += 4;
    pdf.text(contract.signedBy, margin + 90, y);
    y += 4;
    pdf.text(new Date(contract.signedAt).toLocaleString('ro-RO', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }), margin + 90, y);
    y += 4;
    pdf.setFontSize(7);
    pdf.text(`Token: ${contract.signedToken || 'N/A'}`, margin + 90, y);
    
    pdf.setFontSize(12); // Reset font size
  } else {
    // Traditional signature lines for unsigned contracts
    pdf.text('_________________', margin, y);
    pdf.text('_________________', margin + 90, y);
  }
  
  return Buffer.from(pdf.output('arraybuffer'));
}