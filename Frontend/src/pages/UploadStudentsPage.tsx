// src/pages/UploadStudentsPage.tsx

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { Search, Upload, Download, Loader2, AlertCircle, CheckCircle, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../UI/Card'; // Adjust path
import Button from '../UI/Button1'; // Adjust path
import Input from '../UI/Input'; // Adjust path
import Modal from '../UI/Modal'; // Adjust path
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../UI/Table'; // Adjust path

import { jsPDF, TextOptionsLight } from 'jspdf';
import QRCode from 'qrcode';

const API_BASE_URL = 'http://localhost:5000/api';

export interface StudentData {
    id: string;
    rollNumber?: string | null;
    applicationNumber: string;
    candidateName: string;
    gender?: string | null;
    category?: string | null;
    dob?: string | null; // YYYY-MM-DD
    personWithDisability?: string | null;
    scribeRequired?: string | null;
    examName: string;
    paperMedium?: string | null;
    dateOfExamination?: string | null; // YYYY-MM-DD
    reportingTime?: string | null;
    gateClosingTime?: string | null;
    timingOfTest?: string | null;
    testCentreNumber?: string | null;
    venueOfTest: string;
    fatherName?: string | null;
    photoUrl?: string | null;
    signatureUrl?: string | null;
    hallTicketStatus?: 'NotGenerated' | 'Generating' | 'Generated' | 'Error';
    hallTicketError?: string | null;
}

const mockProcessedStudents: StudentData[] = [
    { id: 'file_upload_001', candidateName: 'Aditya Sharma', applicationNumber: 'JEE25A001', rollNumber: 'DL010001', dob: '2005-03-15', gender: "Male", category: "General", personWithDisability: "No", scribeRequired: "No", examName: 'Joint Entrance Examination (Main) - Session 1, 2025', paperMedium: 'English', dateOfExamination: '2025-07-10', reportingTime: '07:30 AM', gateClosingTime: '08:30 AM', timingOfTest: '09:00 AM to 12:00 PM', testCentreNumber: 'UP1201', venueOfTest: 'Ion Digital Zone IDZ 1, Sector 62, Noida, Gautam Budh Nagar, Uttar Pradesh, India - 201301', fatherName: 'Rakesh Sharma', hallTicketStatus: 'NotGenerated' },
    { id: 'file_upload_002', candidateName: 'Priya Singh', applicationNumber: 'JEE25A002', rollNumber: 'MH020002', dob: '2004-07-22', gender: "Female", category: "OBC", personWithDisability: "No", scribeRequired: "No", examName: 'Joint Entrance Examination (Main) - Session 1, 2025', paperMedium: 'English', dateOfExamination: '2025-07-10', reportingTime: '07:30 AM', gateClosingTime: '08:30 AM', timingOfTest: '09:00 AM to 12:00 PM', testCentreNumber: 'MH0105', venueOfTest: 'Apex Online Services Plot No. A-13, MIDC, Marol Industrial Area, Andheri East, Mumbai, Maharashtra - 400069', fatherName: 'Suresh Singh', hallTicketStatus: 'NotGenerated' },
];

const formatDateForDisplay = (dateString?: string | null, format: 'DD-MM-YYYY' | 'YYYY-MM-DD' = 'DD-MM-YYYY'): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Use UTC methods to avoid timezone issues with date-only strings
        const checkDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        if (isNaN(checkDate.getTime())) {
            const parts = dateString.split(/[-/]/);
            if (parts.length === 3) {
                // Try YYYY-MM-DD first
                let y = parseInt(parts[0],10);
                let m = parseInt(parts[1],10);
                let d = parseInt(parts[2],10);
                if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y > 1900 && m >=1 && m <=12 && d >=1 && d <=31) {
                     if (format === 'DD-MM-YYYY') return `${String(d).padStart(2,'0')}-${String(m).padStart(2,'0')}-${y}`;
                     return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                }
                // Try DD-MM-YYYY
                d = parseInt(parts[0],10);
                m = parseInt(parts[1],10);
                y = parseInt(parts[2],10);
                 if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y > 1900 && m >=1 && m <=12 && d >=1 && d <=31) {
                     if (format === 'DD-MM-YYYY') return `${String(d).padStart(2,'0')}-${String(m).padStart(2,'0')}-${y}`;
                     return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                 }
            }
            return dateString; // Return original if still invalid
        }

        const day = checkDate.getUTCDate().toString().padStart(2, '0');
        const month = (checkDate.getUTCMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const year = checkDate.getUTCFullYear();

        if (format === 'DD-MM-YYYY') return `${day}-${month}-${year}`;
        return `${year}-${month}-${day}`;
    } catch {
        return dateString;
    }
};

const UploadStudentsPage: React.FC = () => {
    const [students, setStudents] = useState<StudentData[]>(
        mockProcessedStudents.map(s => ({ ...s, hallTicketStatus: 'NotGenerated' }))
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    const [toasterMessage, setToasterMessage] = useState<string | null>(null);
    const [toasterType, setToasterType] = useState<'success' | 'error' | null>(null);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);


    useEffect(() => {
        if (toasterMessage) {
            const timer = setTimeout(() => {
                setToasterMessage(null);
                setToasterType(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toasterMessage]);

    const fetchStudentsListFromBackend = async () => {
        setIsLoadingList(true);
        setApiError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/students`);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to fetch student list.");
            }
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setStudents(result.data.map((s: StudentData) => ({ ...s, hallTicketStatus: 'NotGenerated' })));
            } else {
                throw new Error(result.error || "Invalid data format for student list.");
            }
        } catch (error: any) {
            setApiError(error.message);
            setToasterMessage(error.message); setToasterType('error');
            setStudents(mockProcessedStudents.map(s => ({ ...s, hallTicketStatus: 'NotGenerated' })));
        } finally {
            setIsLoadingList(false);
        }
    };

    useEffect(() => {
        // fetchStudentsListFromBackend(); // Uncomment to load from backend initially
    }, []);


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setUploadError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            const msg = 'Please select a file to upload.';
            setUploadError(msg); setToasterMessage(msg); setToasterType('error');
            return;
        }
        setIsUploading(true); setUploadError(null); setToasterMessage(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${API_BASE_URL}/students/upload`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || `File upload failed. Status: ${response.status}`);
            }
            setToasterMessage(result.message || `Successfully uploaded students.`);
            setToasterType('success');
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            fetchStudentsListFromBackend();
        } catch (error: any) {
            const msg = error.message || 'Failed to upload and process students.';
            setUploadError(msg); setToasterMessage(msg); setToasterType('error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = [
            "applicationNumber", "rollNumber", "candidateName", "gender", "category",
            "dob(YYYY-MM-DD)", "personWithDisability", "scribeRequired",
            "examName", "paperMedium", "dateOfExamination(YYYY-MM-DD)",
            "reportingTime(HH:MM AM/PM)", "gateClosingTime(HH:MM AM/PM)", "timingOfTest(HH:MM AM/PM - HH:MM AM/PM)",
            "testCentreNumber", "venueOfTest", "fatherName"
        ];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "jee_student_data_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToasterMessage('Template CSV downloaded.');
        setToasterType('success');
    };

    const generateAndShowHallTicket = async (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (!student) {
            setToasterMessage('Student not found.'); setToasterType('error');
            return;
        }

        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, hallTicketStatus: 'Generating', hallTicketError: null } : s));

        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10; // mm
            const contentWidth = pageWidth - 2 * margin;
            let y = margin; // Current Y position
            const photoBoxWidth = 30; // Define it early if used in calculations

            // --- Helper to add text with label and value ---
            // Parameters with defaults must come after required parameters or also have defaults.
            // Making yPosition optional and customMaxWidth optional with a default.
            const addField = (
                label: string,
                value?: string | null,
                yPosition?: number, // This is fine as it's before params with defaults
                labelFontWeight: 'bold' | 'normal' = 'normal',
                valueFontWeight: 'bold' | 'normal' = 'bold',
                yIncrement = 6,
                valueXOffset = 35,
                customMaxWidth: number | undefined = undefined // Optional with default undefined
            ) => {
                let currentY = yPosition !== undefined ? yPosition : y; // Use let for currentY
                if (currentY + yIncrement > pageHeight - margin - 5) { // Adjusted threshold
                    doc.addPage();
                    currentY = margin; // Reset y for the new page
                    // Optionally redraw header/border on new page if needed
                }
                doc.setFont('helvetica', labelFontWeight);
                doc.text(label, margin, currentY);
                doc.setFont('helvetica', valueFontWeight);
                doc.text(value || 'N/A', margin + valueXOffset, currentY, { maxWidth: customMaxWidth || contentWidth - (margin + valueXOffset) - photoBoxWidth - 15 });
            
                if (yPosition === undefined) {
                    y = currentY + yIncrement; // Update global y only if yPosition wasn't passed
                }
                return currentY + yIncrement; // Return the y for the next line based on current field
            };
            
            const addFieldRight = (
                label: string,
                currentYVal: number, // Explicit y is required
                value?: string | null,
                labelFontWeight: 'bold' | 'normal' = 'normal',
                valueFontWeight: 'bold' | 'normal' = 'bold',
                valueXOffset = 30, // Adjusted for right column
                customMaxWidth: number | undefined = undefined
            ) => {
                const xPos = pageWidth / 2 + 3; // Start of right column
                doc.setFont('helvetica', labelFontWeight);
                doc.text(label, xPos, currentYVal);
                doc.setFont('helvetica', valueFontWeight);
                doc.text(value || 'N/A', xPos + valueXOffset, currentYVal, {maxWidth: customMaxWidth || pageWidth - margin - (xPos + valueXOffset) - 5 });
            };


            // --- 1. Header ---
            doc.setFontSize(9); doc.setFont('helvetica', 'normal');
            doc.text("Government of India", margin, y);
            doc.text("NATIONAL TESTING AGENCY", pageWidth - margin, y, { align: 'right' } as TextOptionsLight);
            y += 6;
            doc.setFontSize(12); doc.setFont('helvetica', 'bold');
            const examNameParts = student.examName.split('-');
            doc.text(examNameParts[0].trim().toUpperCase(), pageWidth / 2, y, { align: 'center' } as TextOptionsLight);
            if (examNameParts[1]) {
                y += 5;
                doc.setFontSize(10); doc.setFont('helvetica', 'normal');
                doc.text(examNameParts[1].trim(), pageWidth / 2, y, { align: 'center' } as TextOptionsLight);
            }
            y += 5;
            doc.setFontSize(10); doc.setFont('helvetica', 'bold');
            doc.text("E-Admit Card Provisional", pageWidth / 2, y, { align: 'center' } as TextOptionsLight);
            y += 8;

            // --- 2. Candidate Info & Photo Section ---
            // const photoBoxWidth = 30; // Already defined above
            const photoBoxHeight = 40;
            const photoBoxX = pageWidth - margin - photoBoxWidth;
            const infoSectionStartY = y; // Correctly defined here

            doc.setFontSize(8);
            let currentInfoYLeft = infoSectionStartY;
            let currentInfoYRight = infoSectionStartY;

            const addStudentInfoField = (label: string, value: string | null | undefined, column: 'left' | 'right') => {
                const labelOffset = 35;
                const availableWidthForValue = (pageWidth / 2) - margin - labelOffset - 10; // Space for value in one column
                
                if (column === 'left') {
                    doc.setFont('helvetica', 'normal'); doc.text(label, margin, currentInfoYLeft);
                    doc.setFont('helvetica', 'bold'); doc.text(value || 'N/A', margin + labelOffset, currentInfoYLeft, { maxWidth: availableWidthForValue });
                    currentInfoYLeft += 5;
                } else {
                    const xPos = pageWidth / 2 + 3;
                    doc.setFont('helvetica', 'normal'); doc.text(label, xPos, currentInfoYRight);
                    doc.setFont('helvetica', 'bold'); doc.text(value || 'N/A', xPos + labelOffset - 5 , currentInfoYRight, { maxWidth: availableWidthForValue });
                    currentInfoYRight += 5;
                }
            };
            
            addStudentInfoField("Roll Number:", student.rollNumber, 'left');
            addStudentInfoField("Candidate's Name:", student.candidateName.toUpperCase(), 'left');
            addStudentInfoField("Gender:", student.gender, 'left');
            addStudentInfoField("Category:", student.category, 'left');
            addStudentInfoField("Scribe / Reader:", student.scribeRequired, 'left');

            // Use addStudentInfoField for right column as well for consistent y tracking per column
            addStudentInfoField("Application Number:", student.applicationNumber, 'right');
            addStudentInfoField("Father's Name:", student.fatherName?.toUpperCase(), 'right');
            addStudentInfoField("Date of Birth (DD-MM-YYYY):", formatDateForDisplay(student.dob), 'right');
            addStudentInfoField("Person With Disability (PwD):", student.personWithDisability, 'right');


            // Photo Placeholder
            doc.setDrawColor(100); doc.setLineWidth(0.3);
            doc.rect(photoBoxX, infoSectionStartY, photoBoxWidth, photoBoxHeight);
            doc.setFontSize(7); doc.setTextColor(120);
            doc.text("Affix your recent passport size colour photograph (3.5cm x 4.5cm)", photoBoxX + photoBoxWidth / 2, infoSectionStartY + photoBoxHeight / 2 - 3, { align: 'center', maxWidth: photoBoxWidth - 4 } as TextOptionsLight);
            doc.text("Do not attest.", photoBoxX + photoBoxWidth / 2, infoSectionStartY + photoBoxHeight / 2 + 3, { align: 'center', maxWidth: photoBoxWidth - 4 } as TextOptionsLight);
            doc.setTextColor(0);

            // Candidate Signature Placeholder (below photo)
            const candidateSigY = infoSectionStartY + photoBoxHeight + 2;
            doc.rect(photoBoxX, candidateSigY, photoBoxWidth, 15);
            doc.setFontSize(7); doc.setTextColor(120);
            doc.text("Candidate's Signature (To be signed in presence of Invigilator)", photoBoxX + photoBoxWidth / 2, candidateSigY + 7.5, { align: 'center', baseline: 'middle', maxWidth: photoBoxWidth - 4 } as TextOptionsLight);
            doc.setTextColor(0);
            
            y = Math.max(currentInfoYLeft, currentInfoYRight, candidateSigY + 15) + 5;


            // --- Barcode and Thumb Impression ---
            const barcodeHeight = 10;
            const thumbImpressionWidth = 40;
            const barcodeWidth = contentWidth - thumbImpressionWidth - 10; // Space between barcode and thumb
            doc.setFontSize(7); doc.setTextColor(120);
            doc.text("Barcode Placeholder", margin + barcodeWidth / 2, y + barcodeHeight/2, {align: 'center', baseline: 'middle'} as TextOptionsLight);
            doc.rect(margin, y, barcodeWidth, barcodeHeight);
            doc.text("Candidate's Left Thumb Impression (To be put before reaching the centre)", margin + barcodeWidth + 5 + thumbImpressionWidth/2, y + barcodeHeight/2, {align: 'center', baseline: 'middle', maxWidth: thumbImpressionWidth -2} as TextOptionsLight);
            doc.rect(margin + barcodeWidth + 5, y, thumbImpressionWidth, barcodeHeight);
            y += barcodeHeight + 8;
            doc.setTextColor(0);

            // --- Test Details Section ---
            doc.setLineWidth(0.3); doc.line(margin, y, pageWidth - margin, y); y += 1; doc.line(margin, y, pageWidth - margin, y); y += 4;
            doc.setFontSize(10); doc.setFont('helvetica', 'bold');
            doc.text("Test Details", margin, y); y += 5;
            doc.setFontSize(8);

            let testDetailRowY = y;
            const addTestDetail = (label: string, value: string | null | undefined, col: 1 | 2, currentY: number) => {
                const labelX = col === 1 ? margin : pageWidth / 2 + 3;
                const valueX = col === 1 ? margin + 55 : pageWidth / 2 + 3 + 30;
                const maxWidth = col === 1 ? (pageWidth / 2 - margin - 55 - 3) : (pageWidth - margin - (pageWidth / 2 + 3 + 30) -3);

                doc.setFont('helvetica', 'normal'); doc.text(label, labelX, currentY);
                doc.setFont('helvetica', 'bold'); doc.text(value || 'N/A', valueX, currentY, {maxWidth});
                return currentY; // Return currentY for next item in same row if needed
            };
            
            addTestDetail("Question Paper Medium:", student.paperMedium, 1, testDetailRowY);
            // For the second item on the first row of test details, it's empty in sample, so we don't call addTestDetail for col 2 here.
            testDetailRowY += 5;

            addTestDetail("Date of Examination:", formatDateForDisplay(student.dateOfExamination), 1, testDetailRowY);
            addTestDetail("Reporting/Entry Time at Centre:", student.reportingTime, 2, testDetailRowY);
            testDetailRowY += 5;

            addTestDetail("Gate Closing Time of Centre:", student.gateClosingTime, 1, testDetailRowY);
            addTestDetail("Timing of Test:", student.timingOfTest, 2, testDetailRowY);
            testDetailRowY += 5;
            
            addTestDetail("Test Centre No.:", student.testCentreNumber, 1, testDetailRowY);
            testDetailRowY += 5;

            doc.setFont('helvetica', 'normal'); doc.text("Venue of Test:", margin, testDetailRowY);
            doc.setFont('helvetica', 'bold');
            const venueLines = doc.splitTextToSize(student.venueOfTest, contentWidth - (margin + 55)); // Use full width available for value
            doc.text(venueLines, margin + 55, testDetailRowY);
            y = testDetailRowY + (venueLines.length * 4) + 5; // Using 4 as approx line height for font size 8


            // QR Code and Senior Director Signature
            const qrDataToEncode = JSON.stringify({
                appId: student.applicationNumber, name: student.candidateName,
                rollNo: student.rollNumber, dob: student.dob, exam: student.examName.substring(0,20)
            });
            const qrCodeUrl = await QRCode.toDataURL(qrDataToEncode, { errorCorrectionLevel: 'M', margin: 1, width: 120 });
            const qrSize = 22;
            const directorSigX = pageWidth - margin - 70;
            const qrCodeX = directorSigX - qrSize - 10;

            doc.addImage(qrCodeUrl, 'PNG', qrCodeX, y, qrSize, qrSize);
            doc.setFontSize(8);
            doc.text("Senior Director - NTA", directorSigX, y + qrSize - 3, { align: 'left' } as TextOptionsLight);
            doc.line(directorSigX, y + qrSize - 5, directorSigX + 60, y + qrSize - 5);
            y += qrSize + 8;

            // Self-Declaration
            doc.setLineWidth(0.3); doc.line(margin, y, pageWidth - margin, y); y += 1; doc.line(margin, y, pageWidth - margin, y); y += 4;
            doc.setFontSize(9); doc.setFont('helvetica', 'bold');
            doc.text("SELF DECLARATION (UNDERTAKING)", margin, y); y += 5;
            doc.setFontSize(7); doc.setFont('helvetica', 'normal');
            const exampleDeclarationText = [
                `I, ${student.candidateName}, resident of ______________________________, do hereby, declare the following:`,
                "1. I have read the Instructions, Guidelines and relevant orders pertaining to COVID-19 pandemic. I have read Information Bulletin, Instructions and Notices related to this examination available on the website of NTA.",
                "2. I have in the last 14 days (please tick ✓, wherever it is applicable to you, otherwise strike off):",
                "   a) The following flu-like symptoms: Fever [  ] Cough [  ] Breathlessness [  ] Sore throat / Runny Nose [  ] Body ache [  ] Others (Please specify) ___________",
                "   b) Been in close contact with a confirmed case of COVID-19. ('Close contact' means being at less than one meter for more than 15 minutes.): [  ] Yes [  ] No",
                "   c) Not been in close contact with a person suffering from COVID-19 and I am NOT under mandatory quarantine: [  ]",
                "   d) Travelled the following cities/country in the last 14 days prior to arriving at the Centre:",
                "      1st City ______________ 2nd City ______________ 3rd City ______________ 4th City ______________",
                "3. The health and wellbeing of our community is our first priority; therefore, the centre reserves the right to deny entry to its premises.",
                "4. I have read all the “Important Instructions for Candidates” and “Advisory for Candidates regarding COVID-19” as given with the Admit Card and I undertake to abide by the same."
            ];
            const declLines = doc.splitTextToSize(exampleDeclarationText.join("\n"), contentWidth);
            doc.text(declLines, margin, y);
            y += (declLines.length * 2.8) + 5;
            doc.line(margin + 40, y, margin + 100, y);
            doc.text("Signature of Candidate", margin + 45, y + 3);
            y += 10;

            // Instructions Page
            doc.addPage();
            y = margin;
            doc.setFontSize(10); doc.setFont('helvetica', 'bold');
            doc.text("Important Instructions for Candidates", pageWidth / 2, y, { align: 'center' } as TextOptionsLight);
            y += 7;
            doc.setFontSize(8); doc.setFont('helvetica', 'normal');
            const exampleInstructions = [
                "1. The Admit Card is provisional, subject to satisfying the eligibility conditions as given in the Information Bulletin.",
                "2. Candidates are advised to verify the location of the test venue a day in advance.",
                "3. Candidates are required to report at the Examination Centre at the Reporting Time mentioned on the Admit Card.",
                "4. No candidate shall be permitted to enter the Examination Centre after the Gate Closing Time.",
                "5. Candidates must bring a printed copy of this Admit Card along with one passport size photograph (same as uploaded on the Online Application Form) to be pasted on the attendance sheet at the Centre.",
                "6. Candidates must also bring one original valid Photo Identification Proof (NOT photocopy or scanned copy) such as PAN card/Driving License/Voter ID/Passport/Aadhaar Card (With photograph)/E-Aadhaar/Ration Card/12th Class Admit card.",
                "7. PwD candidates must bring a PwD certificate issued by the Competent Authority if claiming relaxation under PwD category. Scribe candidates must carry their Scribe's documents.",
                "8. Candidates are NOT allowed to carry any personal belongings including electronic devices, mobile phone and other banned/prohibited items listed in the Information Bulletin to the Examination Centre.",
                "9. Candidates will be provided with blank paper sheets for rough work in the examination Hall/Room. Candidates must write their Name and Roll Number at the top of each sheet and must drop the sheet(s) in the designated drop box before leaving the Examination Hall/Room.",
                "10. Duly filled in Admit Card (with photograph pasted and undertaking signed) must be dropped in the designated Drop Box while leaving the Examination Hall/Room. Failure to do so may result in non-evaluation of your answers.",
                "11. No Candidate should adopt any unfair means or indulge in any unfair examination practices. All the Examination Centres are under surveillance of CCTV and equipped with Jammers.",
                "12. Candidates are advised to check updates on NTA's websites regularly. They should also check their mailbox on the registered E-mail address and SMS in their registered Mobile No. for latest updates and information.",
            ];
            const instLines = doc.splitTextToSize(exampleInstructions.join("\n\n"), contentWidth);
            doc.text(instLines, margin, y);


            doc.output('dataurlnewwindow', { filename: `HallTicket_${student.applicationNumber}.pdf` });

            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, hallTicketStatus: 'Generated' } : s));
            setToasterMessage(`Hall ticket for ${student.candidateName} opened for viewing.`);
            setToasterType('success');

        } catch (error: any) {
            console.error('Error generating single hall ticket:', error);
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, hallTicketStatus: 'Error', hallTicketError: error.message } : s));
            setToasterMessage(`Failed to generate hall ticket for ${student.candidateName}. Details: ${error.message}`);
            setToasterType('error');
        }
    };

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter(student =>
            Object.values(student).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [students, searchTerm]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
            {toasterMessage && (
                <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg z-50 flex items-center space-x-2 ${toasterType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toasterType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{toasterMessage}</span>
                    <button onClick={() => setToasterMessage(null)} className="ml-auto font-bold cursor-pointer p-1 hover:bg-white/20 rounded-full leading-none">&times;</button>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800">Upload Student Data & Generate Hall Tickets</h1>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                    <Button variant="outline" onClick={handleDownloadTemplate}>
                        <Download size={16} className="mr-2" /> Template
                    </Button>
                    <Button onClick={() => setIsUploadModalOpen(true)}>
                        <Upload size={16} className="mr-2" /> Upload Data
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <h2 className="text-lg font-medium text-gray-700">Uploaded Student List ({students.length})</h2>
                        <div className="relative w-full md:w-64">
                            <Input id='search-students-input' type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full" disabled={students.length === 0} />
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {isLoadingList ? (
                         <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-900" /><p className="ml-2 text-gray-600">Loading student list...</p></div>
                    ): apiError && students.length === 0 ? (
                        <div className="text-center py-8 text-red-500">Error: {apiError} <Button variant="outline" size="sm" onClick={fetchStudentsListFromBackend} className="ml-2">Retry</Button></div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">{searchTerm ? 'No students matching search.' : 'No student data. Upload an Excel/CSV file.'}</div>
                    ) : filteredStudents.length === 0 && searchTerm ? (
                        <div className="text-center py-8 text-gray-500">No students found matching search criteria.</div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader className="text-left">Name</TableHeader>
                                    <TableHeader className="text-left">App. No</TableHeader>
                                    <TableHeader className="text-left">Roll No</TableHeader>
                                    <TableHeader className="text-left">DOB</TableHeader>
                                    <TableHeader className="text-left">Exam</TableHeader>
                                    <TableHeader className="text-left">Center</TableHeader>
                                    <TableHeader className="text-center">Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.candidateName}</TableCell>
                                        <TableCell>{student.applicationNumber}</TableCell>
                                        <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                                        <TableCell>{formatDateForDisplay(student.dob)}</TableCell>
                                        <TableCell>{student.examName}</TableCell>
                                        <TableCell className="text-xs max-w-[200px] truncate">{student.venueOfTest}</TableCell>
                                        <TableCell className="text-center">
                                            {student.hallTicketStatus === 'Generating' ? (
                                                <Loader2 size={16} className="animate-spin text-indigo-600 mx-auto" />
                                            ) : student.hallTicketStatus === 'Error' ? (
                                                <div className="flex flex-col items-center">
                                                    <AlertCircle size={16} className="text-red-500" />
                                                    <span className="text-xs text-red-500">Error</span>
                                                     <Button variant="outline" size="sm" className="mt-1 text-xs" onClick={() => generateAndShowHallTicket(student.id)}>Retry</Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant={student.hallTicketStatus === 'Generated' ? "success" : "primary"}
                                                    size="sm"
                                                    onClick={() => generateAndShowHallTicket(student.id)}
                                                    className="text-xs"
                                                >
                                                    <Eye size={14} className="mr-1.5" />
                                                    {student.hallTicketStatus === 'Generated' ? 'View/Re-Generate' : 'Generate & View'}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isUploadModalOpen} onClose={() => { setIsUploadModalOpen(false); setSelectedFile(null); setUploadError(null); }} title="Upload Student Data File (Excel/CSV)">
                 <div className="space-y-4">
                    <p className="text-sm text-gray-600">Upload Excel/CSV. Columns: Application Number, Roll Number, Candidate's Name, DOB (YYYY-MM-DD), Gender, Category, PwD, Scribe, Exam Name, Paper Medium, Exam Date (YYYY-MM-DD), Reporting Time, Gate Closing Time, Timing of Test, Test Centre Number, Venue of Test, Father's Name.</p>
                    <div className="text-sm text-blue-600 hover:underline cursor-pointer" onClick={handleDownloadTemplate}>Download CSV Template</div>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <input type="file" id="file-upload" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} key={selectedFile ? selectedFile.name : 'file-input-key-reset'} />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-blue-600">Click to select file</span>
                            <span className="text-xs text-gray-500 mt-1">Excel (.xlsx, .xls) or CSV (.csv)</span>
                        </label>
                        {selectedFile && (<div className="mt-4 text-sm"><span className="font-medium">Selected:</span> {selectedFile.name}</div>)}
                    </div>
                    {uploadError && (<div className="text-sm text-red-600 text-center mt-2 p-2 bg-red-50 rounded-md">{uploadError}</div>)}
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="outline" onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); setUploadError(null); }} disabled={isUploading}>Cancel</Button>
                        <Button onClick={handleUpload} isLoading={isUploading} disabled={!selectedFile || isUploading}>
                            {isUploading ? <><Loader2 size={16} className="animate-spin mr-2"/> Processing...</> : 'Upload & Process'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UploadStudentsPage;
