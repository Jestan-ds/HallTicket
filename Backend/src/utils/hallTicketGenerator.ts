// src/utils/hallTicketGenerator.ts
import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from 'path';
import { Writable } from 'stream';

// Define fonts (ensure these paths are correct relative to your project structure)
const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, '..', '..', 'fonts', 'Roboto-Regular.ttf'),
    bold: path.resolve(__dirname, '..', '..', 'fonts', 'Roboto-Bold.ttf'),
    italics: path.resolve(__dirname, '..', '..', 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: path.resolve(__dirname, '..', '..', 'fonts', 'Roboto-BoldItalic.ttf'),
  },
};

const printer = new PdfPrinter(fonts);

const hallTicketsDir = path.resolve(__dirname, '..', '..', 'public', 'hall_tickets');
if (!fs.existsSync(hallTicketsDir)) {
  fs.mkdirSync(hallTicketsDir, { recursive: true });
}

interface HallTicketDetails {
  studentName: string;
  dob: string | Date;
  examName: string;
  applicationId: string;
  userId: number; // Or string
  rollNumber?: string;
  seatNumber: string | null;
  examDate: string | Date;     // Expecting a Date object or a string parseable by new Date()
  examTime: string | null;     // Expecting "HH:MM" or "HH:MM:SS"
  examVenue: string | null;
  paperMedium?: string;
  gender?: string;
  category?: string;
  pwdStatus?: string;
}

// --- Helper function to format dates ---
const formatDate = (dateInput: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateInput) return 'N/A';
    try {
        const dateObj = new Date(dateInput);
        if (isNaN(dateObj.getTime())) return 'N/A';
        return dateObj.toLocaleDateString('en-IN', options || { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
        return 'N/A';
    }
};

// --- Helper function to format time (HH:MM AM/PM) ---
const formatTime = (dateObj: Date | null | undefined): string => {
    if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const generateHallTicket = async (details: HallTicketDetails): Promise<string> => {
  const {
    studentName,
    dob,
    examName,
    applicationId,
    rollNumber,
    seatNumber,
    examDate,
    examTime,
    examVenue,
    paperMedium,
    gender,
    category,
    pwdStatus,
  } = details;

  let displayDOB = 'N/A';
  if (dob) {
    const dateObj = new Date(dob);
    if (!isNaN(dateObj.getTime())) {
      displayDOB = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  }

  let displayExamDate = 'N/A';
  let calculatedReportingTime = 'N/A';
  let calculatedGateClosingTime = 'N/A';
  let displayExamTime = 'N/A';

  if (examDate && examTime) {
    const datePart = new Date(examDate).toISOString().substring(0, 10);
    const timeParts = examTime.split(':');
    if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
        if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
            const examStartDateTime = new Date(`${datePart}T${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`);
            if (!isNaN(examStartDateTime.getTime())) {
                displayExamDate = examStartDateTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                displayExamTime = formatTime(examStartDateTime);
                const reportingDateTime = new Date(examStartDateTime.getTime() - 60 * 60 * 1000);
                calculatedReportingTime = formatTime(reportingDateTime);
                const gateClosingDateTime = new Date(examStartDateTime.getTime() - 30 * 60 * 1000);
                calculatedGateClosingTime = formatTime(gateClosingDateTime);
            }
        }
    }
  }
  if(displayExamDate === 'N/A' && examDate) {
    displayExamDate = formatDate(examDate, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if(displayExamTime === 'N/A' && examTime) {
    displayExamTime = examTime; // Fallback to raw time string if parsing fails
  }

  const qrDataString = JSON.stringify({
    name: studentName,
    appId: applicationId,
    rollNo: rollNumber || 'N/A',
    exam: examName,
    dob: displayDOB, // Use the display-formatted DOB for consistency if scanned
  });

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 80, 40, 60],
    header: { /* ... (same as before) ... */ },
    footer: (currentPage: number, pageCount: number) => ({ /* ... (same as before) ... */ }),
    content: [
      { text: `${examName.toUpperCase()} - ADMIT CARD`, style: 'documentTitle', alignment: 'center', margin: [0, 0, 0, 20] },
      {
        columns: [
          {
            width: '*',
            layout: 'noBorders',
            table: {
              body: [
                [{ text: 'Roll Number:', style: 'label' }, { text: rollNumber || 'N/A', style: 'valueBold' }],
                [{ text: 'Application Number:', style: 'label' }, { text: applicationId, style: 'value' }],
                [{ text: "Candidate's Name:", style: 'label' }, { text: studentName.toUpperCase(), style: 'valueBold' }],
                [{ text: 'Gender:', style: 'label' }, { text: gender || 'N/A', style: 'value' }],
                [{ text: 'Date of Birth (DD/MM/YYYY):', style: 'label' }, { text: displayDOB, style: 'value' }],
                [{ text: 'Category:', style: 'label' }, { text: category || 'N/A', style: 'value' }],
                [{ text: 'Person with Disability (PwD):', style: 'label' }, { text: pwdStatus || 'No', style: 'value' }],
              ]
            }
          },
          {
            width: 150, // Width of the right column
            stack: [
              { text: 'Affix recent Passport size Photograph (Do not staple)', style: 'placeholderLabel', alignment: 'center' },
              { canvas: [{ type: 'rect', x: 0, y: 0, w: 120, h: 150, r: 3, lineColor: '#AAAAAA',lineWidth: 0.5 }], alignment: 'center', margin: [0, 5, 0, 15] },
              { text: "Candidate's Signature\n(To be signed in presence of invigilator)", style: 'placeholderLabel', alignment: 'center' },
              { canvas: [{ type: 'rect', x: 0, y: 0, w: 120, h: 50, r: 3, lineColor: '#AAAAAA',lineWidth: 0.5 }], alignment: 'center', margin: [0, 5, 0, 0] }
            ],
            margin: [10, 0, 0, 0]
          }
        ],
        margin: [0, 0, 0, 15]
      },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#AAAAAA' }], margin: [0, 0, 0, 15] },
      { text: 'TEST DETAILS', style: 'sectionHeader' },
      {
        layout: 'noBorders',
        table: {
          widths: ['auto', '*', 'auto', '*'],
          body: [
            [{text: 'Question Paper Medium:', style: 'label'}, {text: paperMedium || 'English', style: 'value'}, {text: 'Exam:', style: 'label'}, {text: examName, style: 'valueBold'}],
            [{text: 'Date of Examination:', style: 'label'}, {text: displayExamDate, style: 'valueBold'}, {text: 'Reporting/Entry Time at Centre:', style: 'label'}, {text: calculatedReportingTime, style: 'valueBold'}],
            [{text: 'Timing of Test:', style: 'label'}, {text: displayExamTime, style: 'value'}, {text: 'Gate Closing Time of Centre:', style: 'label'}, {text: calculatedGateClosingTime, style: 'valueBold'}],
            [{text: 'Test Centre No:', style: 'label'}, {text: seatNumber ? `CN${seatNumber.substring(0,3)}` : 'N/A', style: 'value'}, {}, {}],
            [{text: 'Venue of Test:', style: 'label', colSpan: 1}, {text: examVenue || 'To be announced', style: 'value', colSpan: 3}, {}, {}],
          ]
        },
        margin: [0, 0, 0, 15]
      },
      {
        columns: [
            {
                stack: [
                    { text: 'SCAN QR CODE FOR DETAILS', style: 'placeholderLabel', alignment: 'left', margin: [0,0,0,5] },
                    {
                        qr: qrDataString,
                        fit: 110, // <<<< INCREASED QR CODE SIZE HERE (e.g., from 80 to 110 or 120)
                        alignment: 'left',
                        // Optional: Add error correction level if needed, though default is usually fine
                        // version: 4, // You can experiment with QR version if data is large
                        // eccLevel: 'M' // Error correction level: L, M, Q, H
                    },
                ]
            },
            {
                stack: [
                     { text: 'Signature of Invigilator', style: 'placeholderLabel', alignment: 'right', margin: [0,30,0,5] },
                     { canvas: [{ type: 'rect', x: 0, y: 0, w: 180, h: 40, r:3, lineColor: '#AAAAAA', lineWidth: 0.5 }], alignment: 'right' },
                ],
                width: '*',
            }
        ],
         margin: [0, 10, 0, 20]
      },
      // ... (Self Declaration and Instructions sections remain the same as previous version)
      { text: 'SELF DECLARATION (UNDERTAKING)', style: 'sectionHeader' },
      {
        text: [
          "I, ", { text: studentName, bold: true }, ", resident of ______________________________, do hereby, declare the following:",
        ],
        style: 'smallText',
        margin: [0, 0, 0, 10]
      },
      {
        ol: [
            "I have read the Instructions, Guidelines and relevant orders pertaining to this examination.",
            "I have, in the last 14 days (please tick, wherever it is applicable to you, otherwise leave blank):",
            {
                ul: [
                    "the following flu-like symptoms: \nFever: ☐ Sore throat/runny nose: ☐ Body ache: ☐ Cough: ☐ Breathlessness: ☐ Other (please specify): ____________",
                    "been in close contact with a confirmed case of COVID-19. ('Close contact' means being at less than one meter for more than 15 minutes.): ☐",
                    "not been in close contact with a person suffering from COVID-19 and am NOT under mandatory quarantine: ☐",
                    "travelled the following cities/country in the last 14 days prior to arriving at the Centre: \n1st City: __________ 2nd City: __________ 3rd City: __________ 4th City: __________"
                ],
                style: 'smallText', margin: [20, 5, 0, 5], type: 'none'
            },
            "The health and wellbeing of our community is our first priority; therefore, the centre reserves the right to deny entry to its premises.",
            "I have read the detailed “IMPORTANT INSTRUCTIONS for CANDIDATES” as given on Page 2 and I undertake to abide by the same."
        ],
        style: 'smallText',
        margin: [0,0,0,15]
      },
      { text: [ "Candidate's Signature: ____________________________", "\nCandidate's Name: ", {text: studentName, bold: true} ], style: 'smallText', margin: [0, 20, 0, 20]},
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#AAAAAA' }], margin: [0, 0, 0, 15], pageBreak: 'before' },
      { text: 'IMPORTANT INSTRUCTIONS FOR CANDIDATES (Page 2)', style: 'sectionHeader', margin:[0,0,0,10] },
      {
        ol: [
            // ... (Keep your detailed instructions here from the previous version) ...
          'Candidates must bring a printed copy of this E-Admit Card to the examination centre along with one recent passport size photograph (same as uploaded) to be pasted on the attendance sheet.',
          'No candidate will be allowed entry without this E-Admit Card and a valid original Photo ID (must be original, valid, and non-expired) - e.g., School Identity Card, PAN card, Driving License, Voter ID, Passport, Aadhaar Card (With photograph), E-Aadhaar with photograph, Ration Card with photograph, Bank Passbook with Photograph.',
          'Reach the examination centre by the reporting time mentioned. No candidate will be allowed entry after the gate closing time.',
          'Items prohibited in the examination hall include mobile phones, smart watches, calculators, electronic gadgets, textual material (printed or written), eatables (except transparent water bottle and diabetic candidates may carry sugar tablets/fruits like banana/apple/orange), etc. Rough sheets will be provided in the examination hall.',
          'Candidates are advised to visit the examination venue a day in advance to confirm its location, travel time, and mode of transport.',
          'Follow all instructions given by the invigilators and examination functionaries. Maintain silence and discipline in the examination hall.',
          'Any candidate found using unfair means, or impersonating, will be debarred from the examination and may be liable for legal action.',
          'Do not leave the examination hall/room without the permission of the invigilator until the completion of the test and handing over the OMR/Answer sheet/Rough Sheets to the invigilator.',
          'The E-Admit Card is provisional, subject to the candidate satisfying all eligibility conditions mentioned in the Information Bulletin/Prospectus.',
          'Ensure that the photograph and signature on this admit card (if printed) are clearly visible. The candidate should also sign in the presence of the Invigilator on the Attendance Sheet.',
          'In case of any discrepancy in the particulars of the candidate or his/her photograph and signatures shown in the E-Admit Card and Confirmation Page, the candidate should immediately approach the Helpline between 10:00 am and 5:00 pm.',
          'Retain this E-Admit Card safely for future reference. It may be required during counselling/admission.',
          'Biometric registration/thumb impression may be captured before/during the examination.',
          'Dress Code: Candidates are advised to wear light clothes which will not be used for hiding any instruments or communication devices. Candidates wearing articles of faith (customary/religious dress) should report at the centre at least two hours prior to the last reporting time for mandatory frisking.',
          'For any queries or clarifications, candidates can write to the official email address or contact the helpline numbers provided on the official website of the examination body.'
        ],
        style: 'instructionsList',
      },
    ],
    styles: { /* ... (same styles as before) ... */
      headerLeft: { fontSize: 10, bold: true, color: '#444444' },
      headerMain: { fontSize: 14, bold: true, color: '#222222' },
      headerRight: { fontSize: 8, color: '#666666' },
      documentTitle: { fontSize: 16, bold: true, color: '#333333' },
      sectionHeader: { fontSize: 12, bold: true, color: '#000000', margin: [0, 10, 0, 5], decoration: 'underline' },
      label: { fontSize: 9, bold: true, color: '#555555' },
      value: { fontSize: 9, color: '#000000' },
      valueBold: { fontSize: 9, bold: true, color: '#000000' },
      placeholderLabel: { fontSize: 8, color: '#777777', italics: true },
      smallText: { fontSize: 9, color: '#333333', lineHeight: 1.3 },
      instructionsList: { fontSize: 9, margin: [0, 0, 0, 0], lineHeight: 1.4, color: '#333333' },
      footer: { fontSize: 8, color: '#666666' }
    },
    defaultStyle: { font: 'Roboto', fontSize: 10 },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const fileName = `hall_ticket_${applicationId}_${Date.now()}.pdf`;
  const filePath = path.join(hallTicketsDir, fileName);

  await new Promise<void>((resolve, reject) => {
    const stream: Writable = fs.createWriteStream(filePath);
    pdfDoc.pipe(stream as NodeJS.WritableStream);
    pdfDoc.end();
    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });

  const publicUrl = `/hall_tickets/${fileName}`;
  return publicUrl;
};