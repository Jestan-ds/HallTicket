import React, { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, Download, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../UI/Card'; // Assuming your UI components
import Button from '../UI/Button1'; // Assuming your Button component
import Input from '../UI/Input'; // Assuming your Input component
import Modal from '../UI/Modal'; // Assuming your Modal component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../UI/Table'; // Assuming your Table components

// --- Frontend PDF and QR Code Libraries ---
// You'll need to install these libraries in your project:
// npm install jspdf qrcode
// or
// yarn add jspdf qrcode
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode'; // Using 'qrcode' library for server-side or canvas generation


// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your base URL is different

// --- Define the structure for student data from the Excel file ---
// This interface reflects the columns expected in the uploaded Excel/CSV file
export interface UploadedStudentData {
    // Assuming a unique identifier from the upload, could be application_no or a generated ID
    // Backend should ideally assign a unique ID upon processing the file data
    id: string; // Unique ID for this uploaded record (could be generated on backend or derived)
    name: string;
    roll_no?: string; // Optional, depending on template
    application_no?: string; // Optional, depending on template
    dob: string; // Date of Birth (recommendYYYY-MM-DD format from Excel)
    exam_name: string; // Exam Name from the file
    exam_center_name: string; // Exam Center Name from the file
    exam_center_address: string; // Exam Center Address from the file
    // Add other fields from your template as needed (e.g., photo_url, program, college, usn)
    // photo_url?: string;
    // program?: string;
    // college?: string;
    // usn?: string;
}


// --- Mock Data (Simulates data received from backend after processing the uploaded file) ---
const mockProcessedStudents: UploadedStudentData[] = [
    { id: 'file_upload_001', name: 'Alice Wonderland', application_no: 'APP101', dob: '2000-01-15', exam_name: 'Sample University Entrance Exam', exam_center_name: 'Main Campus Auditorium', exam_center_address: '123 University Rd, City' },
    { id: 'file_upload_002', name: 'Bob The Builder', roll_no: 'ROLL202', dob: '1999-05-20', exam_name: 'Sample University Entrance Exam', exam_center_name: 'Annex Building Hall', exam_center_address: '456 Science Ave, Town' },
    { id: 'file_upload_003', name: 'Charlie Chaplin', application_no: 'APP303', dob: '2001-11-30', exam_name: 'Sample University Entrance Exam', exam_center_name: 'Main Campus Auditorium', exam_center_address: '123 University Rd, City' },
    { id: 'file_upload_004', name: 'David Copperfield', roll_no: 'ROLL404', dob: '1998-07-07', exam_name: 'Sample University Entrance Exam', exam_center_name: 'Annex Building Hall', exam_center_address: '456 Science Ave, Town' },
    // Add more mock students as needed
];
// --- End Mock Data ---


const UploadStudentsPage: React.FC = () => {
    const navigate = useNavigate(); // Still useful for potential navigation away

    // State to hold the student data parsed from the uploaded file
    const [students, setStudents] = useState<UploadedStudentData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false); // Loading state for file upload processing
    const [uploadError, setUploadError] = useState<string | null>(null); // Error state for upload

    const [isGeneratingHallTickets, setIsGeneratingHallTickets] = useState(false); // Loading state for generation
    const [generateError, setGenerateError] = useState<string | null>(null); // Error state for generation

    // State to manage selected students for hall ticket generation
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

    // --- Toaster State ---
    const [toasterMessage, setToasterMessage] = useState<string | null>(null);
    const [toasterType, setToasterType] = useState<'success' | 'error' | null>(null);
    // --------------------

    // --- Effect to automatically hide the toaster message ---
    useEffect(() => {
        if (toasterMessage) {
            const timer = setTimeout(() => {
                setToasterMessage(null);
                setToasterType(null);
            }, 5000); // Hide after 5 seconds

            return () => clearTimeout(timer); // Clean up the timer
        }
    }, [toasterMessage]); // Rerun effect when toasterMessage changes
    // --------------------------------------------------------


    // --- Handle file selection for upload ---
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // Optional: Add file type validation here (e.g., check file.type or file.name extension)
            setSelectedFile(file);
            setUploadError(null); // Clear previous upload errors on new file selection
        }
    };

    // --- Handle student data upload (processing the file) ---
    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError('Please select a file to upload.');
            setToasterMessage('Please select a file to upload.');
            setToasterType('error');
            return;
        }

        setIsUploading(true); // Start upload processing loading state
        setUploadError(null); // Clear previous errors
        setToasterMessage(null); // Clear previous toaster messages
        setToasterType(null);
        setStudents([]); // Clear previous student list while uploading
        setSelectedStudentIds(new Set()); // Clear selections

        


        // --- Simulate Receiving Processed Student Data from Backend ---
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload and processing delay

            // In a real app, this data would come from the API response after successful upload
            const processedStudentData: UploadedStudentData[] = mockProcessedStudents; // Use mock data as if parsed

            setStudents(processedStudentData); // Update state with the processed student list

            setIsUploadModalOpen(false); // Close modal on success
            setSelectedFile(null); // Clear selected file

            // --- Trigger Success Toaster ---
            setToasterMessage(`Successfully uploaded and loaded ${processedStudentData.length} students.`);
            setToasterType('success');
            // -----------------------------

        } catch (error: any) {
            console.error('Error processing uploaded students:', error);
            const errorMessage = error.message || 'Failed to process uploaded students. Please try again.';
            setUploadError(errorMessage);
            // --- Trigger Error Toaster ---
            setToasterMessage(errorMessage);
            setToasterType('error');
            // -----------------------------
        } finally {
            setIsUploading(false); // Stop loading state
        }
    };

    // --- Handle download template ---
    const handleDownloadTemplate = () => {
        // --- Simulate Download Template Action ---
        // In a real app, this would trigger a file download, possibly via an API endpoint
        // e.g., window.open(`${API_BASE_URL}/student-template`); or fetch and create a blob URL

        // --- Trigger Info Toaster (or success if the download starts) ---
        setToasterMessage('Simulating template download...');
        setToasterType('success'); // Or 'info' if you have it
        // ---------------------------------------

        console.log('Simulating download of student data template...');
    };

    // --- Handle Generate Hall Tickets (Frontend Generation) ---
    const handleGenerateHallTickets = async () => {
        const studentsToGenerate = students.filter(student => selectedStudentIds.has(student.id));

        if (studentsToGenerate.length === 0) {
            const msg = 'Please select at least one student to generate hall tickets.';
            setGenerateError(msg);
            setToasterMessage(msg);
            setToasterType('error');
            return;
        }

        setIsGeneratingHallTickets(true); // Start generation loading state
        setGenerateError(null); // Clear previous errors
        setToasterMessage(null); // Clear previous toaster messages
        setToasterType(null);

        try {
            // Initialize jsPDF document with A4 size
            const doc = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size

            const pageHeight = doc.internal.pageSize.height; // Get page height in mm
            const pageWidth = doc.internal.pageSize.width; // Get page width in mm

            const margin = 15; // Page margin in mm
            const contentWidth = pageWidth - 2 * margin;

            for (let i = 0; i < studentsToGenerate.length; i++) {
                const student = studentsToGenerate[i];

                // Add a new page for each student except the first one
                if (i > 0) {
                    doc.addPage();
                }

                // --- Hall Ticket Design ---
                let yOffset = margin; // Current vertical position

                // Outer Border
                doc.setDrawColor(0); // Black color
                doc.setLineWidth(0.5);
                doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin);

                yOffset += 5; // Space after top border

                // Header Section (Title and Exam Name)
                const headerHeight = 25; // Height for the header section
                doc.setFillColor(240, 240, 240); // Light gray background for header
                doc.rect(margin, yOffset, contentWidth, headerHeight, 'F'); // 'F' fills the rectangle

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(50); // Dark gray text
                doc.text('HALL TICKET', pageWidth / 2, yOffset + headerHeight / 3, { align: 'center' });

                doc.setFontSize(14);
                doc.setTextColor(0); // Black text
                doc.text(student.exam_name.toUpperCase(), pageWidth / 2, yOffset + headerHeight * 2 / 3, { align: 'center' });
                yOffset += headerHeight + 5; // Move yOffset below header + space

                // Candidate Details Section
                const candidateDetailsHeight = 35;
                doc.setDrawColor(0); // Black border
                doc.rect(margin, yOffset, contentWidth, candidateDetailsHeight); // Border for this section

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text('Candidate Details:', margin + 5, yOffset + 5);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                let detailY = yOffset + 15;
                const labelX = margin + 10;
                const valueX = margin + 60; // Adjusted alignment for values

                doc.text(`Name:`, labelX, detailY);
                doc.text(student.name, valueX, detailY);
                detailY += 7;

                doc.text(`Roll/Application No:`, labelX, detailY);
                doc.text(student.roll_no || student.application_no || 'N/A', valueX, detailY);
                detailY += 7;

                doc.text(`Date of Birth:`, labelX, detailY);
                doc.text(student.dob, valueX, detailY);
                yOffset += candidateDetailsHeight + 5; // Move yOffset below section + space


                // Exam Center Details Section
                const centerDetailsHeight = 40;
                doc.rect(margin, yOffset, contentWidth, centerDetailsHeight); // Border for this section

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text('Exam Center Details:', margin + 5, yOffset + 5);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                detailY = yOffset + 15;

                doc.text(`Name:`, labelX, detailY);
                doc.text(student.exam_center_name, valueX, detailY);
                detailY += 7;

                doc.text(`Address:`, labelX, detailY);
                // Split address into multiple lines and align
                const addressLines = doc.splitTextToSize(student.exam_center_address, contentWidth - (valueX - margin) - 5); // Wrap address within available space
                doc.text(addressLines, valueX, detailY); // Align address lines
                detailY += (addressLines.length * 7); // Adjust detailY based on lines
                yOffset += centerDetailsHeight + 5; // Move yOffset below section + space


                 // Photo, Signature, and QR Code Section
                 const photoQRSigHeight = 40; // Height for this section in mm
                 const sectionY = yOffset;
                 doc.rect(margin, sectionY, contentWidth, photoQRSigHeight); // Border for this section

                 const column1X = margin + 5; // Left column for signature
                 const column2X = pageWidth / 2; // Center column for QR code
                 const column3X = pageWidth - margin - 5; // Right column for photo

                 const sectionContentY = sectionY + 5; // Vertical offset within the section

                 // Placeholder for Candidate Signature
                 doc.setFont('helvetica', 'normal');
                 doc.setFontSize(10);
                 doc.text('Candidate Signature:', column1X, sectionContentY + 15);
                 doc.line(column1X, sectionContentY + 20, column1X + 50, sectionContentY + 20); // Signature line

                 // Placeholder for Candidate Photo
                 const photoPlaceholderSize = 25; // in mm
                 const photoX = pageWidth - margin - photoPlaceholderSize - 5; // Position from right margin
                 const photoY = sectionContentY + (photoQRSigHeight - photoPlaceholderSize) / 2; // Center vertically in section

                 // Draw placeholder box
                 doc.setDrawColor(150); // Gray color
                 doc.rect(photoX, photoY, photoPlaceholderSize, photoPlaceholderSize); // Photo box

                 // Add placeholder text
                 doc.setFontSize(9);
                 doc.setTextColor(100); // Dark gray color
                 doc.text('Candidate Photo', photoX + photoPlaceholderSize / 2, photoY + photoPlaceholderSize / 2, { align: 'center', baseline: 'middle' });
                 doc.setTextColor(0); // Reset color
                 doc.setDrawColor(0); // Reset color


                // --- Generate and Add QR Code ---
                // Position the QR code in the center column
                const qrCodeSize = 30; // Size in mm
                const qrCodeX = column2X - qrCodeSize / 2; // Center horizontally
                const qrCodeY = sectionContentY + (photoQRSigHeight - qrCodeSize) / 2; // Center vertically in section

                const qrCodeData = `Student ID: ${student.id}\nName: ${student.name}\nRoll/App No: ${student.roll_no || student.application_no || 'N/A'}`;
                let qrCodeDataUrl: string | null = null;
                try {
                    // Generate QR code as data URL (adjust size if needed)
                    qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, { errorCorrectionLevel: 'H', width: 100 });
                } catch (qrError) {
                    console.error('Error generating QR code for student', student.id, qrError);
                    // Handle QR code generation failure
                }

                if (qrCodeDataUrl) {
                    doc.addImage(qrCodeDataUrl, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
                     // Add text below QR code
                     doc.setFontSize(8);
                     doc.text('Scan for Verification', column2X, qrCodeY + qrCodeSize + 3, { align: 'center' });
                } else {
                     doc.setFontSize(10);
                     doc.setTextColor(255, 0, 0); // Red color
                     doc.text('QR Code Failed', column2X, qrCodeY + qrCodeSize / 2, { align: 'center', baseline: 'middle' });
                     doc.setTextColor(0); // Reset color
                }
                // ---------------------------------------

                yOffset = sectionY + photoQRSigHeight + 8; // Move yOffset below the section

                // Instructions Section
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text('Important Instructions:', margin + 5, yOffset);
                yOffset += 8;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                const instructions = [
                    '1. Candidates must carry this Hall Ticket and a valid photo ID proof to the examination center.',
                    '2. Report to the examination center at least 30 minutes before the scheduled time.',
                    '3. Mobile phones, electronic gadgets, and prohibited items are not allowed inside the examination hall.',
                    '4. Follow all instructions given by the invigilators.',
                    '5. Maintain social distancing and follow all safety protocols.',
                    // Add more instructions as needed
                ];
                // Split instructions into lines and add to PDF
                 const instructionLines = doc.splitTextToSize(instructions.join('\n'), contentWidth - 10);
                 doc.text(instructionLines, margin + 5, yOffset);
                // ----------------------------------------------------
            }

            // --- Save the PDF ---
            doc.save(`hall-tickets-${studentsToGenerate.length}-students.pdf`);


            // --- Trigger Success Toaster ---
            setToasterMessage(`Hall tickets generated successfully for ${studentsToGenerate.length} students!`);
            setToasterType('success');
            // -----------------------------

        } catch (error: any) {
            console.error('Error generating hall tickets:', error);
            const errorMessage = error.message || 'Failed to generate hall tickets. Please try again.';
            setGenerateError(errorMessage);
            // --- Trigger Error Toaster ---
            setToasterMessage(errorMessage);
            setToasterType('error');
            // -----------------------------
        } finally {
            setIsGeneratingHallTickets(false); // Stop loading state
        }
    };

    // --- Handle checkbox change for student selection ---
    const handleSelectStudent = (studentId: string, isSelected: boolean) => {
        setSelectedStudentIds(prevSelected => {
            const newSelection = new Set(prevSelected);
            if (isSelected) {
                newSelection.add(studentId);
            } else {
                newSelection.delete(studentId);
            }
            return newSelection;
        });
         setGenerateError(null); // Clear generation error when selection changes
         setToasterMessage(null); // Clear toaster message when selection changes
         setToasterType(null);
    };

    // --- Handle select all checkbox change ---
    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            // Select all currently filtered students
            const allFilteredIds = new Set(filteredStudents.map(student => student.id));
            setSelectedStudentIds(allFilteredIds);
        } else {
            // Deselect all
            setSelectedStudentIds(new Set());
        }
         setGenerateError(null); // Clear generation error when selection changes
         setToasterMessage(null); // Clear toaster message when selection changes
         setToasterType(null);
    };


    // --- Filter students based on search term ---
    const filteredStudents = useMemo(() => {
        return students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.application_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by exam name from file
            student.exam_center_name.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by center name from file
            student.exam_center_address.toLowerCase().includes(searchTerm.toLowerCase()) // Search by center address from file
             // Add other fields from your template if searchable
        );
    }, [students, searchTerm]);


    // --- Determine if all filtered students are selected ---
    const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(student => selectedStudentIds.has(student.id));


    // --- Render Logic ---
    // No initial loading state for fetching exam details from URL anymore
    // Loading states are now only for upload processing and generation
    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6"> {/* Increased max-width slightly */}
             {/* --- Toaster Display --- */}
             {toasterMessage && (
                 <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 flex items-center space-x-2
                              ${toasterType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                     {toasterType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                     <span>{toasterMessage}</span>
                     <button onClick={() => setToasterMessage(null)} className="ml-2 font-bold cursor-pointer">&times;</button>
                 </div>
             )}
             {/* ----------------------- */}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                {/* Page Title */}
                <h1 className="text-2xl font-bold text-gray-800">Upload Student Data & Generate Hall Tickets</h1>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                     {/* Download Template Button */}
                    <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                    >
                        <Download size={16} className="mr-2" />
                        Template
                    </Button>
                    {/* Upload Students Button */}
                    <Button onClick={() => setIsUploadModalOpen(true)}>
                        <Upload size={16} className="mr-2" />
                        Upload Student Data
                    </Button>
                    {/* Generate Hall Tickets Button */}
                    <Button
                        onClick={handleGenerateHallTickets}
                        isLoading={isGeneratingHallTickets}
                        disabled={isGeneratingHallTickets || selectedStudentIds.size === 0} // Disable if no students selected or generating
                    >
                         {isGeneratingHallTickets ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
                        Generate Hall Tickets ({selectedStudentIds.size}) {/* Show count of selected students */}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        {/* Display number of students loaded from the file */}
                        <h2 className="text-lg font-medium text-gray-700">Students from Upload ({students.length})</h2>
                        {/* Search Input */}
                        <div className="relative w-full md:w-64">
                            <Input
                                id='search-input'
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                                disabled={students.length === 0} // Disable search if no data loaded
                            />
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {isUploading ? ( // Show upload processing loading state
                         <div className="flex justify-center items-center py-8">
                             <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
                             <p className="ml-2 text-gray-600">Processing uploaded file...</p>
                         </div>
                    ) : students.length === 0 ? ( // Show message if no students uploaded yet
                         <div className="text-center py-8 text-gray-500">
                             {searchTerm ? 'No students found matching your search.' : 'No student data loaded yet. Use the "Upload Student Data" button to upload an Excel/CSV file.'}
                         </div>
                    ) : filteredStudents.length === 0 && searchTerm ? ( // Show message if no students match search after upload
                         <div className="text-center py-8 text-gray-500">
                             No students found matching your search criteria.
                         </div>
                    ) : (
                         <Table>
                             <TableHead>
                                 <TableRow>
                                     {/* Select All Checkbox */}
                                     <TableHeader className="text-center">
                                         <input
                                             type="checkbox"
                                             className="form-checkbox"
                                             checked={isAllFilteredSelected}
                                             onChange={(e) => handleSelectAll(e.target.checked)}
                                             disabled={filteredStudents.length === 0} // Disable if no students to select
                                         />
                                     </TableHeader>
                                     {/* Table Headers based on UploadedStudentData */}
                                     <TableHeader className="text-left">Name</TableHeader>
                                     <TableHeader className="text-left">Roll/App No</TableHeader>
                                     <TableHeader className="text-left">DOB</TableHeader>
                                     <TableHeader className="text-left">Exam Name</TableHeader>
                                     <TableHeader className="text-left">Exam Center Name</TableHeader>
                                     <TableHeader className="text-left">Exam Center Address</TableHeader>
                                     {/* Add headers for other fields from your template */}
                                 </TableRow>
                             </TableHead>
                             <TableBody>
                                 {filteredStudents.map((student) => (
                                     <TableRow key={student.id}> {/* Use the unique uploaded ID as key */}
                                          {/* Student Selection Checkbox */}
                                          <TableCell className="text-center">
                                             <input
                                                 type="checkbox"
                                                 className="form-checkbox"
                                                 checked={selectedStudentIds.has(student.id)}
                                                 onChange={(e) => handleSelectStudent(student.id, e.target.checked)}
                                             />
                                         </TableCell>
                                         {/* Table Cells based on UploadedStudentData */}
                                         <TableCell className="font-medium">{student.name}</TableCell>
                                         <TableCell>{student.roll_no || student.application_no || 'N/A'}</TableCell>
                                         <TableCell>{student.dob}</TableCell>
                                         <TableCell>{student.exam_name}</TableCell>
                                         <TableCell>{student.exam_center_name}</TableCell>
                                         <TableCell>{student.exam_center_address}</TableCell>
                                         {/* Add cells for other fields */}
                                     </TableRow>
                                 ))}
                             </TableBody>
                         </Table>
                    )}
                </CardContent>
            </Card>

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null); // Clear selected file on close
                    setUploadError(null); // Clear upload error on close
                }}
                title="Upload Student Data File" // Generic title as exam name comes from file
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Upload an Excel or CSV file containing student data and exam details. The file should include columns for Name, Roll/Application No, DOB, Exam Name, Exam Center Name, and Exam Center Address.
                    </p>

                    {/* Link to download template */}
                     <div className="text-sm text-blue-600 hover:underline cursor-pointer" onClick={handleDownloadTemplate}>
                         Download Student Data Template
                     </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".xlsx,.xls,.csv" // Accept Excel and CSV
                            onChange={handleFileChange}
                            key={selectedFile?.name || 'no-file'} // Reset input when file changes
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center justify-center"
                        >
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-blue-600">Click to select file</span>
                            <span className="text-xs text-gray-500 mt-1">Excel or CSV files only (.xlsx, .xls, .csv)</span>
                        </label>

                        {selectedFile && (
                            <div className="mt-4 text-sm">
                                <span className="font-medium">Selected file:</span> {selectedFile.name}
                            </div>
                        )}
                    </div>

                    {uploadError && (
                        <div className="text-sm text-red-600">
                            {uploadError}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsUploadModalOpen(false);
                                setSelectedFile(null); // Clear selected file on close
                                setUploadError(null); // Clear upload error on close
                            }}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            isLoading={isUploading}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? 'Processing...' : 'Upload & Process'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Optional: Display generation error outside the modal */}
             {generateError && (
                 <div className="text-center py-4 text-red-600">
                     <p>{generateError}</p>
                 </div>
             )}
        </div>
    );
};

export default UploadStudentsPage;
