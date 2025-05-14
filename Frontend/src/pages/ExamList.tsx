import React, { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react'; // Import icons for toaster and close button

// Assuming Exam1 type matches the structure from your backend /api/exam/ endpoint response
import { Exam1 } from '../types'; // Keep the type import

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your base URL is different

// --- Inline UI Components (using standard HTML + Tailwind) ---
// These components are defined here to avoid dependencies on your specific ../UI components

// Simple Card component
const SimpleCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md ${className}`}>
            {children}
        </div>
    );
};

const SimpleCardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <div className={`p-4 border-b border-gray-200 ${className}`}>
            {children}
        </div>
    );
};

const SimpleCardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
};

// Simple Button component with variants and loading state
interface SimpleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'danger' | 'default';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const SimpleButton: React.FC<SimpleButtonProps> = ({
    children,
    variant = 'default',
    size = 'md',
    isLoading = false,
    disabled,
    className = '',
    ...props
}) => {
    let baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors';
    let variantStyles = '';
    let sizeStyles = '';

    switch (variant) {
        case 'primary':
            variantStyles = 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500';
            break;
        case 'outline':
            variantStyles = 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500';
            break;
        case 'danger':
            variantStyles = 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500';
            break;
        case 'default':
        default:
            variantStyles = 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400';
            break;
    }

    switch (size) {
        case 'sm':
            sizeStyles = 'px-2.5 py-1.5 text-sm';
            break;
        case 'lg':
            sizeStyles = 'px-6 py-3 text-lg';
            break;
        case 'md':
        default:
            sizeStyles = 'px-4 py-2 text-base';
            break;
    }

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${sizeStyles} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {children}
        </button>
    );
};

// Simple Input component (using standard input)
interface SimpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const SimpleInput: React.FC<SimpleInputProps> = ({ label, id, className = '', ...props }) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`; // Generate ID if not provided
    return (
        <div className="space-y-1">
            {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">{label}</label>}
            <input
                id={inputId}
                className={`block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
                {...props}
            />
        </div>
    );
};


// Simple Badge component
interface SimpleBadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'default';
    className?: string;
}

const SimpleBadge: React.FC<SimpleBadgeProps> = ({ children, variant = 'default', className = '' }) => {
    let variantStyles = '';
    switch (variant) {
        case 'primary':
            variantStyles = 'bg-indigo-100 text-indigo-800';
            break;
        case 'success':
            variantStyles = 'bg-green-100 text-green-800';
            break;
        case 'default':
        default:
            variantStyles = 'bg-gray-100 text-gray-800';
            break;
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles} ${className}`}>
            {children}
        </span>
    );
};

// Simple Modal component
interface SimpleModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div> {/* Added onClick to close on overlay click */}

            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* This element is to trick the browser into centering the modal contents. */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                                {/* Close button in header */}
                                <button
                                    type="button"
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
                                    onClick={onClose}
                                >
                                    <X size={20} aria-hidden="true" />
                                </button>
                                <div className="mt-2">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Buttons are typically passed as children or rendered in a footer area within the children */}
                </div>
            </div>
        </div>
    );
};


// Simple Table components (using standard table elements)
// Ensure no whitespace between the outer component tags and their direct children tags
const SimpleTable: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
            {children}
        </table>
    );
};

const SimpleTableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <thead className={`bg-gray-50 ${className}`}>
            {children}
        </thead>
    );
};

const SimpleTableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
            {children}
        </tbody>
    );
};

const SimpleTableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <tr className={`${className}`}>
            {children}
        </tr>
    );
};

const SimpleTableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <th scope="col" className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
             {children}
        </th>
    );
};

const SimpleTableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <td className={`px-4 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
            {children}
        </td>
    );
};


// --- ExamList Component (using inline Simple UI Components) ---

const ExamList: React.FC = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState<Exam1[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState<Exam1 | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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


    // --- Effect to fetch exams on component mount ---
    useEffect(() => {
        const fetchExams = async () => {
            setIsLoading(true); // Start loading state
            setFetchError(null); // Clear any previous fetch errors

            // Get authentication token (adjust this based on where/how you store your auth token)
            const token = localStorage.getItem('authToken');
            if (!token) {
                const authError = 'Authentication token not found. Please log in.';
                console.error(authError);
                setFetchError(authError);
                setIsLoading(false);
                // Optionally redirect to login if token is missing
                // navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/exam/`, {
                    method: 'GET', // Use GET method to fetch data
                    headers: {
                        'Content-Type': 'application/json', // Standard header
                        'Authorization': `Bearer ${token}`, // Include the auth token in the header
                    },
                    // Include credentials if your backend uses cookies/sessions alongside token
                    credentials: 'include',
                });

                // Check if the response status is OK (200-299)
                if (!response.ok) {
                    // Attempt to parse error body from backend response
                    const errorBody = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                    console.error('Failed to fetch exams:', response.status, errorBody);
                    setFetchError(errorBody.error || `Failed to fetch exams. Status: ${response.status}`);
                    setExams([]); // Ensure the exams list is empty on error
                    return; // Stop processing on error
                }

                // Parse the JSON response body
                const result = await response.json();

                // Assuming your backend returns { success: true, data: [...] } on success
                if (result.success && Array.isArray(result.data)) {
                    // The backend getExams should now return dates in a format parseable by new Date()
                    // and time in HH:MM:SS format.
                    setExams(result.data as Exam1[]); // Update the state with fetched exams
                } else {
                    // Handle cases where response status is OK, but backend indicates failure or unexpected format
                    const errorMessage = result.error || 'Failed to fetch exams: Invalid response format from API.';
                    console.error(errorMessage, result);
                    setFetchError(errorMessage);
                    setExams([]); // Ensure list is empty
                }

            } catch (error: any) {
                // Handle network errors or issues *before* a response is received (e.g., server is down, CORS issues)
                console.error('Error during exam list fetch:', error);
                setFetchError(`An unexpected error occurred while fetching exams: ${error.message}. Please try again later.`);
                setExams([]); // Ensure list is empty on critical failure
            } finally {
                setIsLoading(false); // Always stop loading regardless of success or failure
            }
        };

        fetchExams(); // Call the fetch function when the component mounts
    }, []); // Empty dependency array ensures this effect runs only once on mount


    // Handler for when the trash icon is clicked, opens the confirmation modal
    const handleDeleteClick = (exam: Exam1) => {
        setExamToDelete(exam); // Store the exam to be deleted
        setIsDeleteModalOpen(true); // Open the modal
        setDeleteError(null); // Clear any previous delete errors
        setIsDeleting(false); // Reset delete loading state
        setToasterMessage(null); // Clear any existing toaster message
        setToasterType(null);
    };

    // Handler for when the user confirms deletion in the modal
    const confirmDelete = async () => {
        if (!examToDelete) return; // Should not happen if modal is open correctly

        setIsDeleting(true); // Start delete loading state
        setDeleteError(null); // Clear previous errors
        setToasterMessage(null); // Clear any existing toaster message
        setToasterType(null);

        // Get authentication token for the delete request
        const token = localStorage.getItem('authToken');
        if (!token) {
             const authError = 'Authentication token not found. Cannot delete exam.';
             console.error(authError);
             setDeleteError(authError); // Set error state
             setIsDeleting(false);
             setIsDeleteModalOpen(false); // Close modal on auth error
             // --- Trigger Error Toaster ---
             setToasterMessage(authError);
             setToasterType('error');
             // -----------------------------
             // Optionally redirect to login
             // navigate('/login');
             return;
        }

        // --- Real API call to delete exam ---
        try {
            const response = await fetch(`${API_BASE_URL}/exam/${examToDelete.id}`, {
                method: 'DELETE', // Use DELETE method
                headers: {
                     'Authorization': `Bearer ${token}`, // Include the auth token
                },
                 credentials: 'include', // Include if needed
            });

            // Check if the response status is OK (200-299)
            if (!response.ok) {
                // Attempt to parse error body from backend response
                const errorBody = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                console.error(`Failed to delete exam ${examToDelete.id}:`, response.status, errorBody);
                const errorMessage = errorBody.error || `Failed to delete exam. Status: ${response.status}`;
                setDeleteError(errorMessage); // Set delete error state
                 // --- Trigger Error Toaster ---
                 setToasterMessage(errorMessage);
                 setToasterType('error');
                 // -----------------------------
            } else {
                // Assuming backend returns 200 OK on successful deletion
                console.log(`Exam ${examToDelete.id} deleted successfully.`);
                // Update the local state by removing the deleted exam from the list
                setExams(exams.filter(exam => exam.id !== examToDelete.id));
                 // Clear delete error on success
                 setDeleteError(null);
                 // --- Trigger Success Toaster ---
                 setToasterMessage(`Exam "${examToDelete.name}" deleted successfully.`);
                 setToasterType('success');
                 // -----------------------------
            }

        } catch (error: any) {
            // Handle network errors or issues *before* a response is received
            console.error('Error during exam delete fetch:', error);
            const errorMessage = `An unexpected error occurred during deletion: ${error.message}.`;
            setDeleteError(errorMessage); // Set delete error state
             // --- Trigger Error Toaster ---
             setToasterMessage(errorMessage);
             setToasterType('error');
             // -----------------------------
        } finally {
            setIsDeleting(false); // Always stop delete loading state
            // Close modal after attempt (success or failure)
            setIsDeleteModalOpen(false);
            setExamToDelete(null); // Clear examToDelete state
        }
    };

    // Memoize the filtered exams calculation for performance
    const filteredExams = useMemo(() => { // Use useMemo here
        return exams.filter(exam =>
            // Perform case-insensitive search across relevant fields
            exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.exam_category?.toLowerCase().includes(searchTerm.toLowerCase()) || // Added nullish coalescing for safety
            (exam.exam_mode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) || // Include mode in search
            (exam.exam_time_selection?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) // Include time selection in search
            // Add other searchable fields like description if needed, using ?. and ?? false for optional fields
        );
    }, [exams, searchTerm]); // Recalculate only when exams or searchTerm changes


    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6"> {/* Added some padding */}
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

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Exams</h1>
                {/* Link to the Create Exam page */}
                <Link to="/admin/exams/create">
                    <SimpleButton variant="primary"> {/* Using SimpleButton */}
                        <Plus size={16} className="mr-2" />
                        Create Exam
                    </SimpleButton>
                </Link>
            </div>

            <SimpleCard> {/* Using SimpleCard */}
                <SimpleCardHeader> {/* Using SimpleCardHeader */}
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <h2 className="text-lg font-medium text-gray-700">All Exams</h2>
                        {/* Search Input Container */}
                        <div className="relative w-full md:w-64">
                            <SimpleInput // Using SimpleInput
                                type="text"
                                placeholder="Search exams..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full" // Padding for the icon
                            />
                            {/* Search icon positioned absolutely inside the input container */}
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" /> {/* Added pointer-events-none */}
                        </div>
                    </div>
                </SimpleCardHeader>
                <SimpleCardContent className="overflow-x-auto"> {/* Using SimpleCardContent */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
                            <p className="ml-2 text-gray-600">Loading exams...</p>
                        </div>
                    ) : fetchError ? (
                         <div className="text-center py-8 text-red-600">
                             <p>{fetchError}</p>
                             <p className="mt-2 text-gray-600 text-sm">Please check your network connection and try reloading the page.</p>
                         </div>
                    ) : filteredExams.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No exams found matching your search criteria.' : 'No exams available.'}
                        </div>
                    ) : (
                        // Removed whitespace between SimpleTable and its child
                        <SimpleTable>
                            {/* Removed whitespace between SimpleTableHead and its child */}
                            <SimpleTableHead>
                                {/* Removed whitespace between SimpleTableRow and its child */}
                                <SimpleTableRow>
                                    <SimpleTableHeader className="text-left">Name</SimpleTableHeader>
                                    <SimpleTableHeader className="text-left">Category</SimpleTableHeader>
                                    <SimpleTableHeader className="text-left">Date</SimpleTableHeader>
                                    <SimpleTableHeader className="text-center">Mode / Time</SimpleTableHeader>
                                    <SimpleTableHeader className="text-right">Fee</SimpleTableHeader>
                                    <SimpleTableHeader className="text-center">Actions</SimpleTableHeader>
                                {/* Removed whitespace between SimpleTableRow and its child */}
                                </SimpleTableRow>
                            {/* Removed whitespace between SimpleTableHead and its child */}
                            </SimpleTableHead>
                            {/* Removed whitespace between SimpleTableBody and its child */}
                            <SimpleTableBody>
                                {filteredExams.map((exam) => (
                                    // Removed whitespace between SimpleTableRow and its child
                                    <SimpleTableRow key={exam.id}>
                                        <SimpleTableCell className="font-medium text-left">{exam.name}</SimpleTableCell>
                                        <SimpleTableCell className="text-left">{exam.exam_category}</SimpleTableCell>
                                        <SimpleTableCell className="text-left">{exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'N/A'}</SimpleTableCell>
                                        <SimpleTableCell className="text-center">
                                            <SimpleBadge variant={exam.exam_mode === 'online' ? 'primary' : 'success'}>
                                                {exam.exam_mode === 'online' ? 'Online' : 'Offline'}
                                            </SimpleBadge>
                                            {' '}
                                            <SimpleBadge variant="default">
                                                {exam.exam_time_selection === 'fixed' ? 'Fixed Time' : 'Flexible'}
                                            </SimpleBadge>
                                        </SimpleTableCell>
                                        <SimpleTableCell className="text-right">${exam.exam_fee}</SimpleTableCell>
                                        <SimpleTableCell className="text-center">
                                            <div className="flex space-x-2 justify-center">
                                                <Link to={`/admin/exams/edit/${exam.id}`}>
                                                    <SimpleButton variant="outline" size="sm">
                                                        <Edit size={16} />
                                                    </SimpleButton>
                                                </Link>
                                                <SimpleButton
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(exam)}
                                                    isLoading={isDeleting && examToDelete?.id === exam.id}
                                                    disabled={isDeleting}
                                                >
                                                     <Trash2 size={16} />
                                                </SimpleButton>
                                            </div>
                                        </SimpleTableCell>
                                    {/* Removed whitespace between SimpleTableRow and its child */}
                                    </SimpleTableRow>
                                ))}
                            {/* Removed whitespace between SimpleTableBody and its child */}
                            </SimpleTableBody>
                        {/* Removed whitespace between SimpleTable and its child */}
                        </SimpleTable>
                    )}
                     {/* Optional: Display delete error outside the modal after it closes */}
                    {/* deleteError is now primarily handled by the toaster */}
                    {/* {deleteError && !isDeleteModalOpen && (
                         <div className="text-center py-4 text-red-600">
                             <p>{deleteError}</p>
                         </div>
                    )} */}
                </SimpleCardContent>
            </SimpleCard>

            {/* Delete Confirmation Modal */}
            <SimpleModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Delete"
            >
                <div className="space-y-4">
                    {examToDelete ? (
                        <p>Are you sure you want to delete the exam "<span className="font-semibold">{examToDelete.name}</span>"?</p>
                    ) : (
                         <p>Are you sure you want to delete this exam?</p>
                    )}
                    <p className="text-sm text-red-600">This action cannot be undone.</p>

                    {/* Display delete error inside the modal if it's still open */}
                     {deleteError && isDeleteModalOpen && (
                         <p className="text-red-500 text-sm mt-2">{deleteError}</p>
                     )}

                    <div className="flex justify-end space-x-3 mt-6">
                        <SimpleButton
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </SimpleButton>
                        <SimpleButton
                            variant="danger"
                            onClick={confirmDelete}
                            isLoading={isDeleting}
                            disabled={isDeleting}
                        >
                             Delete
                        </SimpleButton>
                    </div>
                </div>
            </SimpleModal>
        </div>
    );
};

export default ExamList;
