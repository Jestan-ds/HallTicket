// src/pages/HallTicketPreview.tsx

import React, { useRef, useEffect, Fragment } from 'react';
import { Download, Printer } from "lucide-react";
import type { StudentData } from "../types"; // <<< Verify this path
import jsPDF from 'jspdf';
// If you used autoTable in the PDF logic, keep this import
// import 'jspdf-autotable';
import * as QRCodeLib from 'qrcode';


interface HallTicketPreviewProps {
  student: StudentData;
  onClose?: () => void; // Optional onClose prop for modal usage
}

export default function HallTicketPreview({ student, onClose }: HallTicketPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Effect to add print-specific styles
  useEffect(() => {
    // Inject print styles. It's generally better to use a dedicated CSS file
    // with print media queries for robust print styling.
    // These styles attempt to use Tailwind classes within the print media query.
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        /* Hide everything except the print area */
        body > div:not(#print-area) {
          display: none !important;
        }
        /* Ensure print area is block level and takes full width */
        #print-area {
          display: block !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: none !important;
          background-color: white !important;
          color: black !important;
          -webkit-print-color-adjust: exact; /* Keep background colors if needed */
          print-color-adjust: exact;
        }
        /* Hide print/download buttons in the print view */
         .print\\:hidden {
           display: none !important;
         }
         .print\\:!hidden {
           display: none !important;
         }

        /* Apply Tailwind print utility classes */
         .print\\:flex { display: flex !important; }
         .print\\:justify-end { justify-content: flex-end !important; }
         .print\\:items-center { align-items: center !important; }
         .print\\:items-start { align-items: flex-start !important; }
         .print\\:grid { display: grid !important; }
         .print\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
         .print\\:gap-6 { gap: 1.5rem !important; } /* 24px */
         .print\\:gap-4 { gap: 1rem !important; } /* 16px */
         .print\\:gap-2 { gap: 0.5rem !important; } /* 8px */
         .print\\:gap-1 { gap: 0.25rem !important; } /* 4px */
         .print\\:mt-6 { margin-top: 1.5rem !important; } /* 24px */
         .print\\:mt-4 { margin-top: 1rem !important; } /* 16px */
         .print\\:mb-6 { margin-bottom: 1.5rem !important; } /* 24px */
         .print\\:mb-4 { margin-bottom: 1rem !important; } /* 16px */
         .print\\:mb-3 { margin-bottom: 0.75rem !important; } /* 12px */
         .print\\:mb-1 { margin-bottom: 0.25rem !important; } /* 4px */
         .print\\:p-6 { padding: 1.5rem !important; } /* 24px */
         .print\\:p-4 { padding: 1rem !important; } /* 16px */
         .print\\:p-3 { padding: 0.75rem !important; } /* 12px */
         .print\\:p-1 { padding: 0.25rem !important; } /* 4px */
         .print\\:py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
         .print\\:px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
         .print\\:border { border-width: 1px !important; border-style: solid !important; }
         .print\\:border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; }
         .print\\:border-gray-300 { border-color: #d1d5db !important; }
         .print\\:border-gray-500 { border-color: #6b7280 !important; }
         .print\\:rounded-lg { border-radius: 0.5rem !important; }
         .print\\:rounded-md { border-radius: 0.375rem !important; }
         .print\\:rounded-sm { border-radius: 0.125rem !important; }
         .print\\:rounded-none { border-radius: 0 !important; }
         .print\\:shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important; }
         .print\\:shadow-none { box-shadow: none !important; }
         .print\\:bg-white { background-color: white !important; }
         .print\\:bg-gray-50 { background-color: #f9fafb !important; }
         .print\\:bg-transparent { background-color: transparent !important; }
         .print\\:text-center { text-align: center !important; }
         .print\\:text-left { text-align: left !important; }
         .print\\:text-right { text-align: right !important; }
         .print\\:text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
         .print\\:text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
         .print\\:text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
         .print\\:text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
         .print\\:text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
         .print\\:text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
         .print\\:font-bold { font-weight: 700 !important; }
         .print\\:font-semibold { font-weight: 600 !important; }
         .print\\:font-medium { font-weight: 500 !important; }
         .print\\:text-gray-500 { color: #6b7280 !important; }
         .print\\:text-gray-700 { color: #374151 !important; }
         .print\\:text-gray-800 { color: #1f2937 !important; }
         .print\\:text-purple-700 { color: #6d28d9 !important; }
         .print\\:text-red-500 { color: #ef4444 !important; }
         .print\\:text-red-700 { color: #b91c1c !important; }
         .print\\:leading-tight { line-height: 1.25 !important; } /* leading-tight */
         .print\\:list-disc { list-style-type: disc !important; }
         .print\\:pl-5 { padding-left: 1.25rem !important; } /* 20px */
         .print\\:pl-4 { padding-left: 1rem !important; } /* 16px */
         .print\\:mt-1 { margin-top: 0.25rem !important; } /* 4px */
         .print\\:mt-0 { margin-top: 0 !important; }
         .print\\:w-\\[90px\\] { width: 90px !important; }
         .print\\:h-\\[100px\\] { height: 100px !important; }
         .print\\:w-\\[25mm\\] { width: 25mm !important; }
         .print\\:h-\\[30mm\\] { height: 30mm !important; }
         .print\\:h-\\[10mm\\] { height: 10mm !important; }
         .print\\:w-\\[40mm\\] { width: 40mm !important; }
         .print\\:mx-auto { margin-left: auto !important; margin-right: auto !important; }
         .print\\:space-y-1 > *:not([hidden]) ~ *:not([hidden]) { margin-top: 0.25rem !important; --tw-space-y-reverse: 0 !important; }
         .print\\:space-y-2 > *:not([hidden]) ~ *:not([hidden]) { margin-top: 0.5rem !important; --tw-space-y-reverse: 0 !important; }
         .print\\:flex-col { flex-direction: column !important; }
         .print\\:w-1\\/3 { width: 33.333333% !important; }
         .print\\:items-center { align-items: center !important; }
         .print\\:border-b-2 { border-bottom-width: 2px !important; }
         .print\\:w-40 { width: 10rem !important; } /* 160px */
         .print\\:h-12 { height: 3rem !important; } /* 48px */
          .print\\:w-\\[calc\\(33\\%\\ \\-\\ 10px\\)\\] { width: calc(33% - 10px) !important; } /* Approx width for 3 columns with gap */


         /* Ensure specific elements don't break across pages */
         #print-area h1,
         #print-area h2,
         #print-area h3,
         #print-area .info-block,
         #print-area .details-section,
         #print-area .info-grid,
         #print-area .qr-code-section,
         #print-area .instructions-section,
         #print-area .signature-section {
             page-break-inside: avoid;
         }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
         document.head.removeChild(style);
      }
    };
  }, []);


  const handlePrint = () => {
    if (printRef.current) {
       // Using window.open for a cleaner print isolation
       const printWindow = window.open('', '_blank');
       if (printWindow) {
            // Copy styles from the main window's head
            const links = Array.from(document.head.getElementsByTagName('link'))
                .map(link => link.outerHTML).join('');
            const styles = Array.from(document.head.getElementsByTagName('style'))
                 .map(style => style.outerHTML).join('');

            printWindow.document.open();
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${student.name}'s Hall Ticket</title>
                    ${links}
                    ${styles}
                    <style>
                         /* Basic print-only styles */
                        body { margin: 0; padding: 0; }
                        /* Styles needed for the printed content - could be copied from your main CSS */
                         /* Add any styles from your general stylesheet that are needed for the print layout */
                    </style>
                </head>
                <body>
                    <div id="print-area">
                        ${printRef.current.innerHTML}
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();

            // Wait for content to load before printing
            const timer = setTimeout(() => {
                printWindow.focus(); // Required for some browsers
                printWindow.print();
                // printWindow.close(); // Auto-closing might prevent saving, better leave open
            }, 250); // Small delay might help ensure content is rendered

            // If onClose is provided, call it after print window opens
            if (onClose) {
              setTimeout(onClose, 100);
            }
       } else {
           alert('Could not open print window. Please check your browser settings.');
       }
    }
  };


  const handleDownload = async () => {
    const doc = new jsPDF('p', 'mm', 'a4'); // 'p' portrait, 'mm', 'a4'
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15; // mm
    const contentWidth = pageWidth - 2 * margin;

    let yOffset = margin;

    // --- Hall Ticket Design (jsPDF drawing) ---

    // Outer Border
    doc.setDrawColor(0); // Black
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin);

    yOffset += 5; // Space after top border

    // Header Section
    const headerHeight = 25;
    doc.setFillColor(240, 240, 240); // Light gray
    doc.rect(margin, yOffset, contentWidth, headerHeight, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(50);
    // Apply 'as any' to the options object here (Workaround for TS2345)
    doc.text('HALL TICKET / ADMIT CARD', pageWidth / 2, yOffset + headerHeight / 3, { align: 'center' } as any);

    doc.setFontSize(14);
    doc.setTextColor(0);
    // Apply 'as any' to the options object here (Workaround for TS2345)
    doc.text((student.exam_name || 'EXAMINATION').toUpperCase(), pageWidth / 2, yOffset + headerHeight * 2 / 3, { align: 'center' } as any);
    yOffset += headerHeight + 5;

    // Candidate Details & Photo/QR Code Section (jsPDF Drawing)
    const detailsPhotoQRHeight = 45; // Increased height slightly
    doc.rect(margin, yOffset, contentWidth, detailsPhotoQRHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Candidate Details:', margin + 5, yOffset + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    let detailY = yOffset + 15;
    const labelX = margin + 10;
    const valueX = margin + 50; // Adjusted alignment for values

    doc.text('Name:', labelX, detailY);
    doc.text(student.name, valueX, detailY);
    detailY += 7;

    doc.text('Roll/App No:', labelX, detailY);
    doc.text(student.roll_no || student.application_no || 'N/A', valueX, detailY);
    detailY += 7;

    doc.text('Date of Birth:', labelX, detailY);
    doc.text(student.dob, valueX, detailY);
    detailY += 7;

    if (student.gender) {
        doc.text('Gender:', labelX, detailY);
        doc.text(student.gender, valueX, detailY);
        // detailY += 7; // No need to increment if this is last in this block
    }

    if (student.category && !student.gender) { // Added category here if not shown above
         // Adjust detailY only if Gender was present and this is placed below it
         if (student.gender) detailY += 7; // Move down from Gender if present
         doc.text('Category:', labelX, detailY);
         doc.text(student.category, valueX, detailY);
         // detailY += 7;
    }


    // --- Photo Placeholder in PDF ---
    const photoPlaceholderSize = 25; // mm
    const photoPlaceholderX = pageWidth - margin - photoPlaceholderSize - 10; // Position from right
    const photoPlaceholderY = yOffset + (detailsPhotoQRHeight - photoPlaceholderSize) / 2; // Vertically center

    doc.setDrawColor(150); // Gray
    doc.rect(photoPlaceholderX, photoPlaceholderY, photoPlaceholderSize, photoPlaceholderSize);
    doc.setFontSize(9);
    doc.setTextColor(100); // Dark gray
    // Apply 'as any' to the options object here (Workaround for TS2345)
    doc.text('Affix Photo', photoPlaceholderX + photoPlaceholderSize / 2, photoPlaceholderY + photoPlaceholderSize / 2, { align: 'center', baseline: 'middle' } as any);
    doc.setTextColor(0); // Reset
    doc.setDrawColor(0); // Reset
    // -----------------


    // --- QR Code in PDF ---
    const qrCodeSize = 25; // mm
    const qrCodeX = photoPlaceholderX - qrCodeSize - 10; // Position to the left of photo
    const qrCodeY = yOffset + (detailsPhotoQRHeight - qrCodeSize) / 2; // Vertically center

    const qrCodeData = `Student ID: ${student.id}\nName: ${student.name}\nRoll/App No: ${student.roll_no || student.application_no || 'N/A'}`;
    let qrCodeDataUrl: string | null = null;
    try {
        qrCodeDataUrl = await QRCodeLib.toDataURL(qrCodeData, { errorCorrectionLevel: 'L', width: 80 });
    } catch (qrError) {
        console.error('Error generating QR code for student', student.id, qrError);
    }

    if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
        // Add text below QR code
        doc.setFontSize(7);
         // Apply 'as any' to the options object here (Workaround for TS2345)
        doc.text('Scan for Verification', qrCodeX + qrCodeSize / 2, qrCodeY + qrCodeSize + 2, { align: 'center' } as any);
        doc.setFontSize(11); // Reset font size
    } else {
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0); // Red color
        // Apply 'as any' to the options object here (Workaround for TS2345)
        doc.text('QR Code Failed', qrCodeX + qrCodeSize / 2, qrCodeY + qrCodeSize / 2, { align: 'center', baseline: 'middle' } as any);
        doc.setTextColor(0); // Reset color
        doc.setFontSize(11); // Reset font size
    }
    // -----------------


    yOffset += detailsPhotoQRHeight + 5; // Move yOffset below section + space

    // Parent/Guardian and Category Details Section (jsPDF Drawing)
     const additionalDetailsLines:any[] = [];
     if (student.father_name) additionalDetailsLines.push(`Father's Name: ${student.father_name}`);
     if (student.mother_name) additionalDetailsLines.push(`Mother's Name: ${student.mother_name}`);
     // Add category here if not already added in Candidate Details
     if (student.category && !student.gender) additionalDetailsLines.push(`Category: ${student.category}`);


     if (additionalDetailsLines.length > 0) {
        const additionalDetailsText = additionalDetailsLines.join('\n');
        const additionalDetailsSplit = doc.splitTextToSize(additionalDetailsText, contentWidth - 20);
        let additionalDetailsHeight = (additionalDetailsSplit.length * doc.getLineHeight()) + 15; // Changed const to let

        // Check page space
         if (yOffset + additionalDetailsHeight + margin > pageHeight) {
             doc.addPage();
             yOffset = margin + 5;
             doc.setDrawColor(0); doc.setLineWidth(0.5); doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin);
         }

        doc.rect(margin, yOffset, contentWidth, additionalDetailsHeight);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Additional Details:', margin + 5, yOffset + 5); // Changed label to be more general

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);

        doc.text(additionalDetailsSplit, margin + 10, yOffset + 15);

        yOffset += additionalDetailsHeight + 5;
     }


    // Exam Details Section (jsPDF Drawing)
    const examDetailsLines:any[] = [];
    if (student.exam_date) examDetailsLines.push(`Exam Date: ${student.exam_date}`);
    if (student.reporting_time) examDetailsLines.push(`Reporting Time: ${student.reporting_time}`);
    if (student.exam_time) examDetailsLines.push(`Exam Time: ${student.exam_time}`);

    const examDetailsText = examDetailsLines.join('\n');
    // Calculate height based on content, consider multi-column
    let examDetailsHeight = (Math.max( // Changed const to let
        student.exam_date ? 1 : 0,
        (student.reporting_time ? 1 : 0) + (student.exam_time ? 1 : 0) // Estimate lines needed for second column
    ) * doc.getLineHeight()) + 15;
     if (examDetailsHeight < 30) examDetailsHeight = 30;


     // Check page space
      if (yOffset + examDetailsHeight + margin > pageHeight) {
          doc.addPage();
          yOffset = margin + 5;
          doc.setDrawColor(0); doc.setLineWidth(0.5); doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin);
      }

    doc.rect(margin, yOffset, contentWidth, examDetailsHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Examination Schedule:', margin + 5, yOffset + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    let currentY = yOffset + 15;

    const col1X = margin + 10;
    const col2X = pageWidth / 2 + 5; // Start of second column

     if (student.exam_date) {
         doc.text('Exam Date:', col1X, currentY);
         doc.text(student.exam_date, col1X + 30, currentY);
         currentY += 7; // Move down for next item in first column
     }

     let currentYCol2 = yOffset + 15; // Y position for the second column
      if (student.reporting_time) {
          doc.text('Reporting Time:', col2X, currentYCol2);
          doc.text(student.reporting_time, col2X + 40, currentYCol2);
          currentYCol2 += 7; // Move down for next item in second column
      }
      if (student.exam_time) {
          doc.text('Exam Time:', col2X, currentYCol2);
          doc.text(student.exam_time, col2X + 40, currentYCol2);
          // currentYCol2 += 7; // No need to increment if this is the last
      }


    yOffset += examDetailsHeight + 5;


    // Exam Center Details Section (jsPDF Drawing)
    const centerDetailsLines = doc.splitTextToSize((student.exam_center_address || 'N/A') +
        (student.exam_center_city ? `, ${student.exam_center_city}` : '') +
        (student.exam_center_state ? `, ${student.exam_center_state}` : ''),
        contentWidth - (valueX - margin) - 5);
    let centerDetailsHeight = (centerDetailsLines.length * doc.getLineHeight()) + 7 + 15; // Changed const to let
    if (centerDetailsHeight < 40) centerDetailsHeight = 40;


     // Check page space
      if (yOffset + centerDetailsHeight + margin > pageHeight) {
          doc.addPage();
          yOffset = margin + 5;
          doc.setDrawColor(0); doc.setLineWidth(0.5); doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin);
      }

    doc.rect(margin, yOffset, contentWidth, centerDetailsHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Examination Center:', margin + 5, yOffset + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    detailY = yOffset + 15;

    doc.text(`Name:`, labelX, detailY);
    doc.text(student.exam_center_name || 'N/A', valueX, detailY);
    detailY += 7;

    doc.text(`Address:`, labelX, detailY);
    doc.text(centerDetailsLines, valueX, detailY);


     // Calculate vertical space used by this section for next yOffset calculation
     const currentSectionHeight = (centerDetailsLines.length * doc.getLineHeight()) + (detailY - (yOffset + 15)) + 15;
     yOffset += currentSectionHeight + 8;


    // Instructions Section (jsPDF Drawing)
    const instructions = [
        '1. Candidates must carry this Admit Card and a valid photo ID proof to the examination center.',
        '2. Report to the examination center at least 30 minutes before the scheduled time.',
        '3. Candidates must carry a valid photo ID proof along with this Admit Card.',
        '4. No electronic devices including mobile phones are allowed in the examination hall.',
        '5. Follow all instructions given by the invigilators.',
        '6. Maintain social distancing and follow all safety protocols.',
    ];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Important Instructions:', margin + 5, yOffset);
    yOffset += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const instructionLines = doc.splitTextToSize(instructions.join('\n'), contentWidth - 10);

     // Check page space
      const instructionsRenderHeight = (instructionLines.length * doc.getLineHeight()) + 5;
      if (yOffset + instructionsRenderHeight + margin + 20 > pageHeight) {
           doc.addPage();
           yOffset = margin + 5;
           doc.setDrawColor(0); doc.setLineWidth(0.5); doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin);
           doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Important Instructions (Cont.):', margin + 5, yOffset);
           yOffset += 8; doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      }

     doc.text(instructionLines, margin + 5, yOffset);
    yOffset += instructionsRenderHeight + 5;


    // Signature Section (jsPDF Drawing)
     const signatureSectionHeight = 30;
     // Check page space
      if (yOffset + signatureSectionHeight + margin > pageHeight) {
           doc.addPage();
           yOffset = margin + 5;
           doc.setDrawColor(0); doc.setLineWidth(0.5); doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin);
      }


    const sigLineLength = 50; // mm
    const sigLabelY = yOffset + signatureSectionHeight - 8;
    const sigLineY = yOffset + signatureSectionHeight - 5;

    // Calculate positions based on number of required signatures
    const hasGuardianSig = student.father_name || student.mother_name;
    const numSignatures = hasGuardianSig ? 4 : 3; // Candidate, Optional Guardian, Invigilator, Superintendent

    // Define fixed points or calculate spacing
    const marginX = margin + 10;
    // Adjusted spacing calculation to distribute remaining space more evenly
    const totalSigSpaceNeeded = numSignatures * sigLineLength;
    const totalSpaceBetweenSigs = contentWidth - totalSigSpaceNeeded - (numSignatures > 1 ? 2 * marginX : 0); // Adjust for only one signature case
    const spaceBetweenSigs = numSignatures > 1 ? totalSpaceBetweenSigs / (numSignatures - 1) : 0;


    let currentSigDrawX = marginX; // Start drawing from left margin + padding

    // Candidate Signature
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Candidate Signature:', currentSigDrawX, sigLabelY);
    doc.line(currentSigDrawX, sigLineY, currentSigDrawX + sigLineLength, sigLineY);

    currentSigDrawX += sigLineLength + spaceBetweenSigs; // Move X for next signature

    // Optional Guardian Signature
    if (hasGuardianSig) {
        doc.text('Parent/Guardian Signature:', currentSigDrawX, sigLabelY);
        doc.line(currentSigDrawX, sigLineY, currentSigDrawX + sigLineLength, sigLineY);
        currentSigDrawX += sigLineLength + spaceBetweenSigs; // Move X for next signature
    }

    // Invigilator's Signature
    // Position might need adjustment based on previous optional sig
    doc.text("Invigilator's Signature:", currentSigDrawX, sigLabelY);
    doc.line(currentSigDrawX, sigLineY, currentSigDrawX + sigLineLength, sigLineY);

    currentSigDrawX += sigLineLength + spaceBetweenSigs; // Move X for next signature

    // Center Superintendent
    // Position this from the right end for consistent alignment
     const superintendentDrawX = pageWidth - margin - 10 - sigLineLength; // Position from right margin + padding
    doc.text("Center Superintendent:", superintendentDrawX, sigLabelY);
    doc.line(superintendentDrawX, sigLineY, superintendentDrawX + sigLineLength, sigLineY);


     yOffset += signatureSectionHeight + 5;


     // Footer (Optional)
     if (yOffset + 10 < pageHeight - margin) { // Check if footer fits at the bottom
         doc.setFontSize(8);
         doc.setTextColor(100);
         doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, pageHeight - margin, { align: 'left' });
         // Apply 'as any' to the options object here too (Workaround for TS2345)
         doc.text(`Hall Ticket for ${student.name}`, pageWidth - margin, pageHeight - margin, { align: 'right' } as any);
     }


    // --- Save the PDF ---
    const filename = `hall-ticket-${student.roll_no || student.application_no || student.id || 'student'}.pdf`;
    doc.save(filename);

    // If onClose is provided, call it after download is initiated
    if (onClose) {
        onClose();
    }
  };


  // Using Tailwind classes for styling
  return (
    <div className="space-y-4"> {/* Main container */}
      {/* Print/Download Buttons (Hidden in print view) */}
      <div className="flex justify-end gap-2 print:hidden">
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={handlePrint}>
          <Printer size={16} className="mr-2" /> Print
        </button>
        <button
          className="flex items-center px-4 py-2 rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onClick={handleDownload}
        >
          <Download size={16} className="mr-2" /> Download PDF
        </button>
      </div>

      {/* This div contains the content to be printed/downloaded */}
      <div ref={printRef} id="print-area" className="bg-white p-6 border border-gray-200 rounded-lg max-w-a4 mx-auto shadow-md
           print:shadow-none print:p-0 print:border-none print:mx-0 print:max-w-full print:w-full">
        <div className="text-center mb-6 print:mb-4">
          {/* Use exam_name from student data */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-md inline-block mb-2
             print:bg-none print:text-black print:p-0 print:rounded-none print:inline print:mb-0">
             {/* Use exam_name from student data */}
            <h1 className="text-2xl font-bold print:text-lg">{student.exam_name?.toUpperCase() || 'EXAMINATION'}</h1>
          </div>
          <h2 className="text-xl font-semibold mt-1 print:text-base print:mt-0">HALL TICKET / ADMIT CARD</h2>
        </div>

        <div className="flex justify-between items-start mb-6 print:mb-4">
          {/* Ensure roll_no or application_no is displayed */}
          <div className="space-y-1 print:space-y-0">
            <p className="text-sm text-gray-500 print:text-xs print:font-semibold">Roll/Application Number</p>
            <p className="font-medium text-lg print:text-sm">{student.roll_no || student.application_no || 'N/A'}</p>
          </div>
           {/* Photo Placeholder */}
           <div className="w-[90px] h-[100px] border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-center text-xs text-gray-500 p-1 flex-shrink-0
                print:w-[25mm] print:h-[30mm] print:text-[8px] print:border-gray-500 print:p-0 print:bg-transparent">
              Affix Passport Size Photo
           </div>
        </div>

        <div className="w-full border-t border-gray-200 my-4 print:my-2"></div> {/* Separator */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
          <div className="space-y-4 print:space-y-2">
            <div className="bg-gray-50 p-4 rounded-md print:bg-transparent print:p-0 print:rounded-none">
              <h3 className="font-semibold text-purple-700 mb-3 print:text-gray-800 print:mb-1 print:text-base">Candidate Details</h3>
              <div className="space-y-3 print:space-y-1">
                <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                  <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Name:</p>
                  <p className="col-span-2 font-medium print:text-sm print:col-span-1">{student.name}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                  <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Date of Birth:</p>
                  <p className="col-span-2 print:text-sm print:col-span-1">{student.dob}</p>
                </div>
                 {student.gender && (
                    <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                      <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Gender:</p>
                      <p className="col-span-2 print:text-sm print:col-span-1">{student.gender}</p>
                    </div>
                 )}
                 {student.category && student.gender && (
                     <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                       <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Category:</p>
                       <p className="col-span-2 print:text-sm print:col-span-1">{student.category}</p>
                     </div>
                 )}
              </div>
            </div>

             {/* Additional Details Block (Parent/Guardian, Category if not with gender) */}
             {(student.father_name || student.mother_name || (student.category && !student.gender)) && (
                <div className="bg-gray-50 p-4 rounded-md print:bg-transparent print:p-0 print:rounded-none">
                  <h3 className="font-semibold text-purple-700 mb-3 print:text-gray-800 print:mb-1 print:text-base">Additional Details</h3>
                  <div className="space-y-3 print:space-y-1">
                     {student.father_name && (
                        <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                          <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Father's Name:</p>
                          <p className="col-span-2 print:text-sm print:col-span-1">{student.father_name}</p>
                        </div>
                     )}
                      {student.mother_name && (
                        <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                          <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Mother's Name:</p>
                          <p className="col-span-2 print:text-sm print:col-span-1">{student.mother_name}</p>
                        </div>
                      )}
                       {student.category && !student.gender && ( // Only show category here if NOT shown above
                         <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                           <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Category:</p>
                           <p className="col-span-2 print:text-sm print:col-span-1">{student.category}</p>
                         </div>
                      )}
                  </div>
                </div>
             )}
          </div>

          <div className="space-y-4 print:space-y-2">
            <div className="bg-gray-50 p-4 rounded-md print:bg-transparent print:p-0 print:rounded-none">
              <h3 className="font-semibold text-purple-700 mb-3 print:text-gray-800 print:mb-1 print:text-base">Examination Schedule</h3>
              <div className="space-y-3 print:space-y-1">
                <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                  <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Exam Date:</p>
                  <p className="col-span-2 font-medium print:text-sm print:col-span-1">{student.exam_date || 'N/A'}</p>
                </div>
                 {student.reporting_time && (
                    <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                      <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Reporting Time:</p>
                      <p className="col-span-2 print:text-sm print:col-span-1">{student.reporting_time}</p>
                    </div>
                 )}
                 {student.exam_time && (
                    <div className="grid grid-cols-3 gap-2 print:grid-cols-[auto_1fr] print:gap-1 print:text-sm">
                      <p className="text-sm text-gray-500 print:text-xs print:font-semibold print:col-span-1">Exam Time:</p>
                      <p className="col-span-2 print:text-sm print:col-span-1">{student.exam_time}</p>
                    </div>
                 )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md print:bg-transparent print:p-0 print:rounded-none">
              <h3 className="font-semibold text-purple-700 mb-3 print:text-gray-800 print:mb-1 print:text-base">Examination Center</h3>
              <div className="p-3 border border-gray-200 rounded bg-white print:p-1 print:border-gray-500 print:rounded-sm print:bg-transparent">
                <p className="font-medium print:text-sm">{student.exam_center_name || 'N/A'}</p>
                <p className="text-sm mt-1 print:text-xs print:mt-0">{student.exam_center_address || 'N/A'}</p>
                 {student.exam_center_city && <p className="text-sm mt-1 print:text-xs print:mt-0">City: {student.exam_center_city}</p>}
                 {student.exam_center_state && <p className="text-sm print:text-xs print:mt-0">State: {student.exam_center_state}</p>}
              </div>
            </div>
          </div>
        </div>

         {/* QR Code Section */}
         <div className="mt-6 flex justify-center print:mt-4">
            {/* Generate QR code data URL and use in an img tag */}
            {(student.roll_no || student.application_no || student.id) ? (
                <div className="text-center">
                   {/* Using roll_no or id for QR code value */}
                   <QRCodeImage value={student.roll_no || student.id || student.name} size={100} className="print:w-[25mm] print:h-[25mm]" />
                   <p className="text-xs text-gray-600 mt-1 print:text-[7px] print:mt-0">Scan for Verification</p>
                </div>
            ) : (
                <div className="text-red-500 text-sm print:text-red-700 print:text-xs">QR Code not available</div>
            )}
         </div>


        <div className="mt-6 p-4 bg-gray-50 rounded-md print:bg-transparent print:p-0 print:rounded-none print:mt-4">
          <h3 className="font-semibold text-purple-700 mb-3 print:text-gray-800 print:mb-1 print:text-base">Important Instructions</h3>
          <ul className="text-sm space-y-1 list-disc pl-5 text-gray-700 print:text-xs print:space-y-0 print:pl-4">
            <li>Candidates must carry this Admit Card and a valid photo ID proof to the examination center.</li>
            <li>Candidates should reach the examination center as per the reporting time.</li>
            <li>Candidates must carry a valid photo ID proof along with this Admit Card.</li>
            <li>No electronic devices including mobile phones are allowed in the examination hall.</li>
            <li>Follow all instructions given by the invigilators.</li>
            <li>Maintain social distancing and follow all safety protocols.</li>
          </ul>
        </div>

        {/* Signature Section */}
        <div className="mt-6 flex flex-wrap justify-between items-end print:mt-4 print:text-center print:gap-4 print:flex-wrap"> {/* Adjusted for wrapping */}
          <div className="w-1/2 md:w-1/4 flex flex-col items-center print:w-[calc(33% - 10px)]"> {/* Adjusted widths */}
            <p className="text-sm text-gray-500 print:text-xs print:mb-1">Candidate's Signature</p>
            <div className="mt-1 w-40 h-12 border-b-2 border-gray-300 print:w-[40mm] print:h-[10mm] print:border-gray-500 print:mt-0 print:mx-auto"></div> {/* Line */}
          </div>
           {/* Optional Guardian Signature */}
           {(student.father_name || student.mother_name) && (
              <div className="w-1/2 md:w-1/4 flex flex-col items-center print:w-[calc(33% - 10px)]"> {/* Adjusted widths */}
                 <p className="text-sm text-gray-500 print:text-xs print:mb-1">Parent/Guardian Signature</p>
                 <div className="mt-1 w-40 h-12 border-b-2 border-gray-300 print:w-[40mm] print:h-[10mm] print:border-gray-500 print:mt-0 print:mx-auto"></div> {/* Line */}
              </div>
            )}
          <div className="w-1/2 md:w-1/4 flex flex-col items-center print:w-[calc(33% - 10px)]"> {/* Adjusted widths */}
            <p className="text-sm text-gray-500 print:text-xs print:mb-1">Invigilator's Signature</p>
            <div className="mt-1 w-40 h-12 border-b-2 border-gray-300 print:w-[40mm] print:h-[10mm] print:border-gray-500 print:mt-0 print:mx-auto"></div> {/* Line */}
          </div>
          <div className="w-1/2 md:w-1/4 flex flex-col items-center print:w-[calc(33% - 10px)]"> {/* Adjusted widths */}
            <p className="text-sm text-gray-500 print:text-xs print:mb-1">Center Superintendent</p>
            <div className="mt-1 w-40 h-12 border-b-2 border-gray-300 print:w-[40mm] print:h-[10mm] print:border-gray-500 print:mt-0 print:mx-auto"></div> {/* Line */}
          </div>
        </div>

         {/* Footer */}
         <div className="text-center mt-6 text-xs text-gray-500 print:mt-2 print:text-[6px]">
             This is a computer-generated Hall Ticket.
         </div>

      </div>
    </div>
  );
}


// Helper component to generate and display QR Code image
const QRCodeImage: React.FC<{ value: string; size: number; className?: string }> = ({ value, size, className }) => {
    const [dataUrl, setDataUrl] = React.useState<string | null>(null);

    useEffect(() => {
        // Added error handling to catch potential issues in QR code generation
        QRCodeLib.toDataURL(value || 'N/A', { errorCorrectionLevel: 'L', width: size }) // Use 'N/A' if value is empty
            .then(url => setDataUrl(url))
            .catch(err => {
                console.error('QR Code generation error:', err);
                setDataUrl(null); // Set dataUrl to null on error
            });
    }, [value, size]); // Re-generate if value or size changes

    if (!dataUrl) {
        // Display an error or placeholder if QR code failed
        return (
             <div
                 style={{ width: `${size}px`, height: `${size}px` }} // Apply size via inline style
                 className={`flex items-center justify-center text-center text-xs text-red-500 border border-dashed border-gray-400 ${className}`} // Tailwind + border
             >
                 QR Error
             </div>
         );
    }

    return <img src={dataUrl} alt="QR Code" className={`block max-w-full h-auto ${className}`} />; // Tailwind classes for image
};