// src/pages/UploadStudentsPage.tsx

import React, { useState, ChangeEvent, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Optional, remove if not used
import { Upload, Download, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../components/modal'; // <<< Use the Tailwind-styled Modal component
import HallTicketPreview from './HallTicketPreview'; // <<< Verify this path (Use the Tailwind-styled version)
import type { StudentData } from '../types'; // <<< Verify this path

// --- Mock Data (Replace with your actual data parsing logic after upload) ---
// This data should match the StudentData interface structure
const mockProcessedStudents: StudentData[] = [
    {
      id: '1',
      name: 'Alice Smith',
      roll_no: '2023001',
      application_no: 'APP12345',
      dob: '15/03/2005',
      exam_name: 'Annual Exam 2023',
      exam_date: '20/11/2023',
      reporting_time: '08:30 AM',
      exam_time: '09:00 AM',
      gender: 'Female',
      category: 'General',
      father_name: 'David Smith',
      mother_name: 'Emily Smith',
      exam_center_name: 'City Public School',
      exam_center_address: '123 Exam Center Rd',
      exam_center_city: 'Exam City',
      exam_center_state: 'Exam State',
    },
     {
      id: '2',
      name: 'Bob Johnson',
      roll_no: '2023002',
      application_no: 'APP12346',
      dob: '20/07/2004',
      exam_name: 'Annual Exam 2023',
      exam_date: '20/11/2023',
      reporting_time: '08:30 AM',
      exam_time: '09:00 AM',
      gender: 'Male',
      category: 'OBC',
      father_name: 'Peter Johnson',
      mother_name: 'Linda Johnson',
      exam_center_name: 'City Public School',
      exam_center_address: '123 Exam Center Rd',
      exam_center_city: 'Exam City',
      exam_center_state: 'Exam State',
    },
     {
      id: '3',
      name: 'Charlie Brown',
      roll_no: '2023003',
      application_no: 'APP12347',
      dob: '01/01/2006',
      exam_name: 'Annual Exam 2023',
      exam_date: '21/11/2023',
      reporting_time: '09:00 AM',
      exam_time: '09:30 AM',
      gender: 'Male',
      category: 'SC',
      father_name: 'Snoopy Brown',
      mother_name: 'Sally Brown',
      exam_center_name: 'District High School',
      exam_center_address: '456 School Lane, District Town, Exam State', // Address with city/state included
      exam_center_city: 'District Town', // Still provide separately if possible
      exam_center_state: 'Exam State',
    },
     {
      id: '4',
      name: 'Diana Prince',
      roll_no: "2023004", // Example with roll number now
      application_no: 'APP12348',
      dob: '22/04/2005',
      exam_name: 'Annual Exam 2023',
      exam_date: '21/11/2023',
      reporting_time: '09:00 AM',
      exam_time: '09:30 AM',
      gender: 'Female',
      category: 'General',
      father_name: 'Hippolyta',
      mother_name: "Maria Prince", // Added mother's name
      exam_center_name: 'District High School',
      exam_center_address: '456 School Lane, District Town, Exam State', // Address with city/state included
      exam_center_city: 'District Town', // Still provide separately if possible
      exam_center_state: 'Exam State',
    },
    // Add more mock students as needed
];
// ---------------------------------------------------------------


const UploadStudentsPage: React.FC = () => {
    const navigate = useNavigate(); // Optional, remove if not used

    // State to hold the student data parsed from the uploaded file
    const [students, setStudents] = useState<StudentData[]>([]); // Use the common type
    const [searchTerm, setSearchTerm] = useState('');

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false); // Loading state for file upload processing
    const [uploadError, setUploadError] = useState<string | null>(null); // Error state for upload

    // State for viewing a single hall ticket in a modal
    const [isHallTicketModalOpen, setIsHallTicketModalOpen] = useState(false);
    const [selectedStudentForPreview, setSelectedStudentForPreview] = useState<StudentData | null>(null);


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
            setSelectedFile(file);
            setUploadError(null); // Clear previous upload errors
             if (toasterType === 'error') { // Clear error toaster if selecting a new file
                 setToasterMessage(null);
                 setToasterType(null);
             }
        }
    };

    // --- Handle student data upload (processing the file) ---
    const handleUpload = async () => {
        if (!selectedFile) {
            const msg = 'Please select a file to upload.';
            setUploadError(msg);
            setToasterMessage(msg);
            setToasterType('error');
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setToasterMessage(null);
        setToasterType(null);
        setStudents([]); // Clear previous student list


        // --- Simulate Receiving Processed Student Data from Backend/Parsing ---
        // Implement your actual file parsing logic here (e.g., using 'xlsx' or 'papaparse')
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

            const processedStudentData: StudentData[] = mockProcessedStudents; // Replace with actual parsed data

            if (!processedStudentData || processedStudentData.length === 0) {
                 throw new Error('No valid student data found in the file.');
            }

            setStudents(processedStudentData);

            setIsUploadModalOpen(false);
            setSelectedFile(null); // Clear selected file name in the input label

            setToasterMessage(`Successfully uploaded and loaded ${processedStudentData.length} students.`);
            setToasterType('success');

        } catch (error: any) {
            console.error('Error processing uploaded students:', error);
            const errorMessage = error.message || 'Failed to process uploaded students. Please ensure the file format is correct and try again.';
            setUploadError(errorMessage);
            setToasterMessage(errorMessage);
            setToasterType('error');
        } finally {
            setIsUploading(false);
        }
    };

    // --- Handle download template ---
    const handleDownloadTemplate = () => {
        const csvHeaders = [
           'id', 'name', 'roll_no', 'application_no', 'dob', 'exam_name',
           'exam_date', 'reporting_time', 'exam_time', 'gender', 'category',
           'father_name', 'mother_name', 'exam_center_name', 'exam_center_address',
           'exam_center_city', 'exam_center_state'
        ];
        const csvContent = csvHeaders.join(',') + '\n';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'student_data_template.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
             alert('Your browser does not support automatic downloads. Please use the Save As option.');
        }

        setToasterMessage('Student data template download initiated.');
        setToasterType('success');

        console.log('Simulating download of student data template...');
    };


    // --- Handle viewing a single hall ticket ---
    const handleViewHallTicket = (student: StudentData) => {
        setSelectedStudentForPreview(student);
        setIsHallTicketModalOpen(true);
         setUploadError(null); // Clear any previous errors
         setToasterMessage(null); // Clear any previous toaster message
         setToasterType(null);
    };


    // --- Filter students based on search term ---
    const filteredStudents = useMemo(() => {
        return students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.application_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.exam_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.exam_center_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.exam_center_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
             student.exam_center_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             student.exam_center_state?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);


    // --- Render Logic ---
    return (
        <div className="container mx-auto py-8 px-4 md:px-6 space-y-6"> {/* Main page container */}
             {/* --- Toaster Display --- */}
             {toasterMessage && (
                 <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 flex items-center space-x-2 text-white
                          ${toasterType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}> {/* Tailwind toaster classes */}
                     {toasterType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                     <span>{toasterMessage}</span>
                     <button onClick={() => setToasterMessage(null)} className="ml-2 font-bold cursor-pointer">&times;</button>
                 </div>
             )}
             {/* ----------------------- */}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0"> {/* Header container */}
                <h1 className="text-2xl font-bold text-gray-800">Upload Student Data & Manage Hall Tickets</h1>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto"> {/* Button container */}
                     {/* Download Template Button */}
                    <button
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" // Tailwind classes for button
                        onClick={handleDownloadTemplate}
                         disabled={isUploading}
                    >
                        <Download size={16} className="mr-2" /> Template
                    </button>
                    {/* Upload Students Button */}
                    <button
                        className="flex items-center justify-center px-4 py-2 rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed" // Tailwind classes for button
                        onClick={() => setIsUploadModalOpen(true)}
                        disabled={isUploading}
                    >
                        <Upload size={16} className="mr-2" /> Upload Student Data
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden"> {/* Card container */}
                <div className="p-4 md:p-6 border-b border-gray-200"> {/* Card header */}
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"> {/* Header content */}
                        {/* Display number of students loaded from the file */}
                        <h2 className="text-lg font-medium text-gray-700">Students Loaded ({students.length})</h2>
                        {/* Search Input */}
                        <div className="relative w-full md:w-64"> {/* Search input container */}
                            <input
                                id='search-input'
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" // Tailwind classes for input
                                disabled={students.length === 0 && !isUploading}
                            />
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" /> {/* Search icon */}
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-6 overflow-x-auto"> {/* Card content */}
                    {isUploading ? (
                         <div className="flex justify-center items-center py-8 text-gray-600"> {/* Loading state */}
                            <Loader2 size={32} className="animate-spin mr-2 text-gray-900" /> {/* Tailwind spin animation */}
                            <p>Processing uploaded file...</p>
                         </div>
                    ) : students.length === 0 ? (
                         <div className="text-center py-8 text-gray-500"> {/* Empty state message */}
                            {searchTerm ? 'No students found matching your search.' : 'No student data loaded yet. Use the "Upload Student Data" button above to upload an Excel/CSV file.'}
                         </div>
                    ) : filteredStudents.length === 0 && searchTerm ? (
                         <div className="text-center py-8 text-gray-500"> {/* No search results message */}
                             No students found matching your search criteria.
                         </div>
                    ) : (
                         <table className="min-w-full divide-y divide-gray-200"> {/* Tailwind table */}
                             <thead className="bg-gray-50">
                                 <tr>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll/App No</th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Date</th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Center Name</th>
                                     <th scope="col" className="relative px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                 {filteredStudents.map((student) => (
                                     <tr key={student.id} className="hover:bg-gray-50"> {/* Hover effect */}
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.roll_no || student.application_no || 'N/A'}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.exam_name}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.exam_date || 'N/A'}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.exam_center_name || 'N/A'}</td>
                                         {/* Actions Cell */}
                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-center">
                                            <button
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" // Tailwind classes for button
                                                onClick={() => handleViewHallTicket(student)}
                                            >
                                                 View Hall Ticket
                                            </button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                    setUploadError(null);
                }}
                title="Upload Student Data File"
                 size="md" // Set modal size
            >
                <div className="space-y-4"> {/* Modal content wrapper */}
                    <p className="text-sm text-gray-600">
                        Upload an Excel or CSV file containing student data and exam details. The required columns are Name, Roll/Application No, DOB, Exam Name, Exam Date, Exam Center Name, and Exam Center Address. Other fields like Gender, Category, Parent Names, Reporting Time, Exam Time, City, and State are optional but recommended for hall ticket generation.
                    </p>

                     <div
                        className="text-sm text-blue-600 hover:underline cursor-pointer mt-2" // Tailwind classes
                        onClick={handleDownloadTemplate}
                     >
                         Download Student Data Template (.csv)
                     </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center mt-4"> {/* File upload styling */}
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden" // Hide default input
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            key={selectedFile?.name || ''}
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center justify-center"
                        >
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-blue-600">Click to select file</span>
                            <span className="text-xs text-gray-500 mt-1">Excel or CSV files only (.xlsx, .xls, .csv)</span>
                             {selectedFile && (
                                <span className="text-sm text-gray-700 mt-2">Selected: {selectedFile.name}</span>
                             )}
                        </label>
                    </div>

                    {uploadError && (
                        <div className="text-sm text-red-600 mt-2"> {/* Error message styling */}
                            {uploadError}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6"> {/* Modal actions */}
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); setUploadError(null); }}
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex items-center justify-center px-4 py-2 rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : 'Upload & Process'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Hall Ticket Preview Modal */}
            {selectedStudentForPreview && (
                <Modal
                    isOpen={isHallTicketModalOpen}
                    onClose={() => {
                        setIsHallTicketModalOpen(false);
                        setSelectedStudentForPreview(null);
                    }}
                    title={`${selectedStudentForPreview.name}'s Hall Ticket`}
                     size="2xl" // Set a larger size for the hall ticket preview
                >
                    <HallTicketPreview
                        student={selectedStudentForPreview}
                        onClose={() => {
                           setIsHallTicketModalOpen(false);
                           setSelectedStudentForPreview(null);
                        }}
                     />
                </Modal>
            )}

        </div>
    );
};

export default UploadStudentsPage;