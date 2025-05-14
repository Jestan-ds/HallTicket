// src/pages/UploadStudentsPage.tsx

import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
// import { useNavigate } from 'react-router-dom'; // Keep if you use it
import { Search, Upload, Download, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../UI/Card'; // Adjust path
import Button from '../UI/Button1'; // Adjust path
import Input from '../UI/Input'; // Adjust path
import Modal from '../UI/Modal'; // Adjust path
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../UI/Table'; // Adjust path

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

const API_BASE_URL = 'http://localhost:5000/api';

// Interface for student data from Excel/CSV (JEE-like structure)
export interface UploadedStudentData {
    id: string; // Unique ID for this record (e.g., backend generated or combination)
    rollNumber?: string; // Roll Number
    applicationNumber: string; // Application Number
    candidateName: string; // Candidate's Name
    gender?: string;
    category?: string; // e.g., General, OBC, SC, ST
    dob: string; // Date of Birth (YYYY-MM-DD recommended for parsing)
    personWithDisability?: string; // Yes/No, or type
    scribeRequired?: string; // Yes/No

    // Exam Specific Details from Upload (assuming one exam per upload batch for simplicity)
    examName: string;
    paperMedium?: string; // e.g., English, Hindi

    // Test Details (these might be common for all students in an upload if for the same specific test schedule)
    dateOfExamination: string; // YYYY-MM-DD
    reportingTime: string; // e.g., "08:30 AM"
    gateClosingTime: string; // e.g., "09:00 AM"
    timingOfTest: string; // e.g., "09:30 AM to 12:30 PM"

    // Test Centre Details (can vary per student in the upload)
    testCentreNumber?: string; // Optional
    venueOfTest: string; // Full address of the test venue
    // photoUrl?: string; // If a URL to a photo is in the Excel, otherwise placeholder
    // signatureUrl?: string; // If a URL to a signature is in the Excel
}

// --- Mock Data (Simulates data received from backend after processing the uploaded file) ---
const mockProcessedStudents: UploadedStudentData[] = [
    { id: 'file_upload_001', candidateName: 'Aditya Sharma', applicationNumber: 'JEE25A001', rollNumber: 'DL010001', dob: '2005-03-15', gender: "Male", category: "General", personWithDisability: "No", examName: 'Joint Entrance Examination (Main) - Session 1', paperMedium: 'English', dateOfExamination: '2025-07-10', reportingTime: '07:30 AM', gateClosingTime: '08:30 AM', timingOfTest: '09:00 AM to 12:00 PM', testCentreNumber: 'TC001', venueOfTest: 'Ion Digital Zone, Sector 62, Noida, Uttar Pradesh - 201301' },
    { id: 'file_upload_002', candidateName: 'Priya Singh', applicationNumber: 'JEE25A002', rollNumber: 'MH020002', dob: '2004-07-22', gender: "Female", category: "OBC", personWithDisability: "No", examName: 'Joint Entrance Examination (Main) - Session 1', paperMedium: 'English', dateOfExamination: '2025-07-10', reportingTime: '07:30 AM', gateClosingTime: '08:30 AM', timingOfTest: '09:00 AM to 12:00 PM', testCentreNumber: 'TC002', venueOfTest: 'Apex Online Services, Andheri East, Mumbai, Maharashtra - 400069' },
    // Add more mock students
];

// Helper to format date as DD-MM-YYYY
const formatDateForDisplay = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch {
        return dateString; // Return original on error
    }
};


const UploadStudentsPage: React.FC = () => {
    const [students, setStudents] = useState<UploadedStudentData[]>(mockProcessedStudents); // Start with mock data for now
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isGeneratingHallTickets, setIsGeneratingHallTickets] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [toasterMessage, setToasterMessage] = useState<string | null>(null);
    const [toasterType, setToasterType] = useState<'success' | 'error' | null>(null);

    useEffect(() => {
        if (toasterMessage) {
            const timer = setTimeout(() => {
                setToasterMessage(null);
                setToasterType(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toasterMessage]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setUploadError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            const msg = 'Please select a file to upload.';
            setUploadError(msg);
            setToasterMessage(msg); setToasterType('error');
            return;
        }
        setIsUploading(true); setUploadError(null); setToasterMessage(null);
        setStudents([]); setSelectedStudentIds(new Set());

        // TODO: Replace with actual API call to upload selectedFile (FormData)
        // to your backend (e.g., POST /api/students/upload-jee-data)
        // The backend should parse the Excel (using 'xlsx' or 'exceljs'),
        // validate, process, and store the data.
        // For now, we simulate this with a delay and use mock data.

        console.log("Simulating upload of file:", selectedFile.name);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

        try {
            // Assume backend processes and returns data in UploadedStudentData[] format
            // Or frontend parses CSV/Excel here (less ideal for large files/complex validation)
            const processedData = mockProcessedStudents; // Replace with actual parsed data
            setStudents(processedData);
            setToasterMessage(`Successfully processed ${processedData.length} students from file.`);
            setToasterType('success');
            setIsUploadModalOpen(false);
            setSelectedFile(null);
        } catch (error: any) {
            const msg = error.message || 'Failed to process uploaded student data.';
            setUploadError(msg);
            setToasterMessage(msg); setToasterType('error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        // Create a dummy CSV template content string
        const headers = [
            "applicationNumber", "rollNumber", "candidateName", "gender", "category",
            "dob(YYYY-MM-DD)", "personWithDisability", "scribeRequired",
            "examName", "paperMedium", "dateOfExamination(YYYY-MM-DD)",
            "reportingTime(HH:MM AM/PM)", "gateClosingTime(HH:MM AM/PM)", "timingOfTest(HH:MM AM/PM - HH:MM AM/PM)",
            "testCentreNumber", "venueOfTest"
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

    const handleGenerateHallTickets = async () => {
        const studentsToGenerate = students.filter(student => selectedStudentIds.has(student.id));
        if (studentsToGenerate.length === 0) {
            const msg = 'Please select at least one student.';
            setGenerateError(msg); setToasterMessage(msg); setToasterType('error');
            return;
        }

        setIsGeneratingHallTickets(true); setGenerateError(null); setToasterMessage(null);

        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            // const pageHeight = doc.internal.pageSize.getHeight(); // Use if needed
            const margin = 10; // mm
            const contentWidth = pageWidth - 2 * margin;

            for (let i = 0; i < studentsToGenerate.length; i++) {
                const student = studentsToGenerate[i];
                if (i > 0) doc.addPage();

                let y = margin;

                // --- Header ---
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text("Ministry of Education", margin, y);
                doc.text("NATIONAL TESTING AGENCY", pageWidth - margin, y, { align: 'right' });
                y += 7;
                doc.setFontSize(12);
                doc.text(student.examName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
                y += 5;
                doc.setFontSize(10);
                doc.text("Admit Card Provisional", pageWidth / 2, y, { align: 'center' });
                y += 10;

                // --- Candidate Basic Info & Photo ---
                const photoBoxWidth = 35; // mm
                const photoBoxHeight = 45; // mm
                const photoBoxX = pageWidth - margin - photoBoxWidth;

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                const fieldStartY = y;
                doc.text("Roll Number:", margin, y); doc.setFont('helvetica', 'bold'); doc.text(student.rollNumber || 'N/A', margin + 35, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Application Number:", margin, y); doc.setFont('helvetica', 'bold'); doc.text(student.applicationNumber, margin + 35, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Candidate's Name:", margin, y); doc.setFont('helvetica', 'bold'); doc.text(student.candidateName.toUpperCase(), margin + 35, y); doc.setFont('helvetica', 'normal');
                y += 6;
                // Father's Name removed based on prior feedback for other hall tickets
                doc.text("Gender:", margin, y); doc.setFont('helvetica', 'bold'); doc.text(student.gender || 'N/A', margin + 35, y);  doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Date of Birth:", margin, y); doc.setFont('helvetica', 'bold'); doc.text(formatDateForDisplay(student.dob), margin + 35, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Category:", margin, y); doc.setFont('helvetica', 'bold'); doc.text(student.category || 'N/A', margin + 35, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Person with Disability:", margin, y); doc.setFont('helvetica', 'bold'); doc.text(student.personWithDisability || 'No', margin + 45, y); doc.setFont('helvetica', 'normal');
                y += 6;
                if (student.scribeRequired && student.scribeRequired.toLowerCase() === 'yes') {
                    doc.text("Scribe Requested:", margin, y); doc.setFont('helvetica', 'bold'); doc.text("Yes", margin + 35, y); doc.setFont('helvetica', 'normal');
                    y += 6;
                }

                // Photo Placeholder
                doc.rect(photoBoxX, fieldStartY - 2, photoBoxWidth, photoBoxHeight);
                doc.setFontSize(8);
                doc.text("Affix recent passport", photoBoxX + photoBoxWidth / 2, fieldStartY + photoBoxHeight / 2 - 2, { align: 'center', maxWidth: photoBoxWidth - 4 });
                doc.text("size photograph", photoBoxX + photoBoxWidth / 2, fieldStartY + photoBoxHeight / 2 + 2, { align: 'center', maxWidth: photoBoxWidth - 4 });

                // Signature placeholder below photo
                const sigBoxY = fieldStartY + photoBoxHeight + 2;
                doc.rect(photoBoxX, sigBoxY, photoBoxWidth, 15); // Signature box
                doc.text("Candidate's Signature", photoBoxX + photoBoxWidth / 2, sigBoxY + 7, { align: 'center', maxWidth: photoBoxWidth - 4 });


                // --- Test Details ---
                y += 10; // Space before test details
                doc.setFontSize(10); doc.setFont('helvetica', 'bold');
                doc.text("Test Details", margin, y);
                y += 5;
                doc.setLineWidth(0.2); doc.line(margin, y, pageWidth - margin, y); // Horizontal line
                y += 5;

                doc.setFontSize(9); doc.setFont('helvetica', 'normal');
                const testDetailLabelX = margin + 5;
                const testDetailValueX = margin + 55;

                doc.text("Question Paper Medium:", testDetailLabelX, y); doc.setFont('helvetica', 'bold'); doc.text(student.paperMedium || 'English', testDetailValueX, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Date of Examination:", testDetailLabelX, y); doc.setFont('helvetica', 'bold'); doc.text(formatDateForDisplay(student.dateOfExamination), testDetailValueX, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Reporting / Entry Time at Centre:", testDetailLabelX, y); doc.setFont('helvetica', 'bold'); doc.text(student.reportingTime, testDetailValueX, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Gate Closing Time of Centre:", testDetailLabelX, y); doc.setFont('helvetica', 'bold'); doc.text(student.gateClosingTime, testDetailValueX, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Timing of Test:", testDetailLabelX, y); doc.setFont('helvetica', 'bold'); doc.text(student.timingOfTest, testDetailValueX, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Test Centre No:", testDetailLabelX, y); doc.setFont('helvetica', 'bold'); doc.text(student.testCentreNumber || 'N/A', testDetailValueX, y); doc.setFont('helvetica', 'normal');
                y += 6;
                doc.text("Venue of Test:", testDetailLabelX, y); doc.setFont('helvetica', 'bold');
                const venueLines = doc.splitTextToSize(student.venueOfTest, contentWidth - (testDetailValueX - margin) - 5);
                doc.text(venueLines, testDetailValueX, y);
                y += (venueLines.length * 5) + 5; // Adjust for venue lines

                // --- QR Code and Self-Declaration ---
                const qrDataToEncode = JSON.stringify({
                    appId: student.applicationNumber,
                    name: student.candidateName,
                    rollNo: student.rollNumber,
                    dob: student.dob,
                    exam: student.examName.substring(0, 20), // Keep QR data concise
                });
                const qrCodeUrl = await QRCode.toDataURL(qrDataToEncode, { errorCorrectionLevel: 'M', width: 150 });
                doc.addImage(qrCodeUrl, 'PNG', margin, y, 30, 30); // QR code on left

                // Self-Declaration (example text)
                doc.setFontSize(8); doc.setFont('helvetica', 'bold');
                doc.text("SELF DECLARATION (UNDERTAKING)", margin + 40, y);
                y += 4;
                doc.setFontSize(7); doc.setFont('helvetica', 'normal');
                const declarationText = [
                    "I, " + student.candidateName + ", do hereby declare that all the information provided on this admit card and in my application form is true and correct to the best of my knowledge and belief.",
                    "I have read and understood all the instructions for this examination.",
                    "I agree to abide by the rules and regulations of the examination authority."
                ];
                const declarationLines = doc.splitTextToSize(declarationText.join(" "), contentWidth - 45); // Width for declaration
                doc.text(declarationLines, margin + 40, y);
                y += (declarationLines.length * 3.5) + 10;


                // Signature of Senior Director
                doc.setFontSize(9);
                doc.text("Senior Director - NTA (Example)", pageWidth - margin - 60, y);
                y+= 5;
                doc.line(pageWidth - margin - 70, y-7, pageWidth - margin - 10, y-7); // Line for signature


                // Instructions (add more as needed)
                // This part can become very long, consider a separate page if needed
                y = Math.max(y, 200); // Ensure instructions start at a certain y-level or new page
                 if (y > 230) { // Check if space is less, add new page
                    doc.addPage();
                    y = margin;
                }
                doc.setFontSize(9); doc.setFont('helvetica', 'bold');
                doc.text("Important Instructions for Candidate:", margin, y);
                y += 5;
                doc.setFontSize(7); doc.setFont('helvetica', 'normal');
                const instructions = [
                    "1. Please check all particulars on the Admit Card carefully. In case of any discrepancy, contact the helpline immediately.",
                    "2. This Admit Card must be presented for verification along with at least one original (not photocopied or scanned) valid photo identification card (e.g. College ID, Aadhaar Card, Driving License, PAN Card, Voter ID, Passport).",
                    "3. Candidates are advised to reach the venue as per the reporting time mentioned. No candidate will be allowed to enter the examination centre after the gate closing time.",
                    // Add more instructions from the JEE sample
                ];
                const instLines = doc.splitTextToSize(instructions.join("\n"), contentWidth);
                doc.text(instLines, margin, y);

            } // End of student loop

            doc.save(`JEE_Style_Hall_Tickets_${studentsToGenerate.length}_students.pdf`);
            setToasterMessage(`Hall tickets generated for ${studentsToGenerate.length} students!`);
            setToasterType('success');

        } catch (error: any) {
            console.error('Error generating hall tickets:', error);
            const msg = error.message || 'Failed to generate hall tickets.';
            setGenerateError(msg); setToasterMessage(msg); setToasterType('error');
        } finally {
            setIsGeneratingHallTickets(false);
        }
    };

    const handleSelectStudent = (studentId: string, isSelected: boolean) => {
        setSelectedStudentIds(prev => {
            const newSelection = new Set(prev);
            isSelected ? newSelection.add(studentId) : newSelection.delete(studentId);
            return newSelection;
        });
        setGenerateError(null); setToasterMessage(null);
    };

    const handleSelectAll = (isSelected: boolean) => {
        setSelectedStudentIds(isSelected ? new Set(filteredStudents.map(s => s.id)) : new Set());
        setGenerateError(null); setToasterMessage(null);
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student =>
            Object.values(student).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [students, searchTerm]);

    const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(student => selectedStudentIds.has(student.id));

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
                    <Button
                        onClick={handleGenerateHallTickets}
                        isLoading={isGeneratingHallTickets}
                        disabled={isGeneratingHallTickets || selectedStudentIds.size === 0}
                    >
                        {isGeneratingHallTickets ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
                        Generate Tickets ({selectedStudentIds.size})
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <h2 className="text-lg font-medium text-gray-700">Uploaded Student List ({students.length})</h2>
                        <div className="relative w-full md:w-64">
                            <Input id='search-input' type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full" disabled={students.length === 0} />
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {isUploading ? (
                        <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-900" /><p className="ml-2 text-gray-600">Processing file...</p></div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">{searchTerm ? 'No students matching search.' : 'No student data. Upload an Excel/CSV file.'}</div>
                    ) : filteredStudents.length === 0 && searchTerm ? (
                        <div className="text-center py-8 text-gray-500">No students found matching search criteria.</div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader className="text-center w-12"><input type="checkbox" className="form-checkbox" checked={isAllFilteredSelected} onChange={(e) => handleSelectAll(e.target.checked)} disabled={filteredStudents.length === 0} /></TableHeader>
                                    <TableHeader className="text-left">Name</TableHeader>
                                    <TableHeader className="text-left">Roll/App No</TableHeader>
                                    <TableHeader className="text-left">DOB</TableHeader>
                                    <TableHeader className="text-left">Exam</TableHeader>
                                    <TableHeader className="text-left">Center</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="text-center"><input type="checkbox" className="form-checkbox" checked={selectedStudentIds.has(student.id)} onChange={(e) => handleSelectStudent(student.id, e.target.checked)} /></TableCell>
                                        <TableCell className="font-medium">{student.candidateName}</TableCell>
                                        <TableCell>{student.rollNumber || student.applicationNumber}</TableCell>
                                        <TableCell>{formatDateForDisplay(student.dob)}</TableCell>
                                        <TableCell>{student.examName}</TableCell>
                                        <TableCell>{student.venueOfTest}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Modal isOpen={isUploadModalOpen} onClose={() => { setIsUploadModalOpen(false); setSelectedFile(null); setUploadError(null); }} title="Upload Student Data File">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Upload Excel/CSV with student data. Ensure columns match the template: Application No, Roll No, Candidate Name, DOB, Gender, Category, PwD, Scribe, Exam Name, Paper Medium, Exam Date, Timings, Center No, Venue.</p>
                    <div className="text-sm text-blue-600 hover:underline cursor-pointer" onClick={handleDownloadTemplate}>Download Template CSV</div>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <input type="file" id="file-upload" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} key={selectedFile ? selectedFile.name : 'file-input'} />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-blue-600">Click to select file</span>
                            <span className="text-xs text-gray-500 mt-1">Excel or CSV (.xlsx, .xls, .csv)</span>
                        </label>
                        {selectedFile && (<div className="mt-4 text-sm"><span className="font-medium">Selected:</span> {selectedFile.name}</div>)}
                    </div>
                    {uploadError && (<div className="text-sm text-red-600">{uploadError}</div>)}
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="outline" onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); setUploadError(null); }} disabled={isUploading}>Cancel</Button>
                        <Button onClick={handleUpload} isLoading={isUploading} disabled={!selectedFile || isUploading}>
                            {isUploading ? 'Processing...' : 'Upload & Process'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {generateError && (<div className="text-center py-4 text-red-600"><p>{generateError}</p></div>)}
        </div>
    );
};

export default UploadStudentsPage;