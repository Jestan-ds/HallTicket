import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'; // Import icons
import { Card, CardContent, CardHeader, CardFooter } from '../UI/Card'; // Assuming these are your UI components
import Button from '../UI/Button1'; // Assuming this is your Button component
import Input from '../UI/Input1'; // Assuming this is your Input component
import Select from '../UI/Select'; // Assuming this is your Select component
import Textarea from '../UI/Textarea'; // Assuming this is your Textarea component
// Assuming Exam1 and ExamLocation types match your backend schema closely
import { Exam1, ExamLocation } from '../types/index';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your base URL is different

// Define the expected structure for locations when sending to the backend edit endpoint
interface ExamLocationForUpdate {
    id?: string; // ID might be needed for updates/identification by backend
    name: string;
    total_seats: number;
    filled_seats?: number; // Include if frontend tracks/sends this, otherwise backend manages
}

const EditExamForm: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Get exam ID from URL
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true); // State for initial data fetch loading
    const [isSubmitting, setIsSubmitting] = useState(false); // State for form submission loading
    const [fetchError, setFetchError] = useState<string | null>(null); // State for errors during fetch
    const [submissionError, setSubmissionError] = useState<string | null>(null); // State for errors during submission

    // --- Toaster State ---
    const [toasterMessage, setToasterMessage] = useState<string | null>(null);
    const [toasterType, setToasterType] = useState<'success' | 'error' | null>(null);
    // --------------------

    // State for form data, initialized with default/empty values
    const [formData, setFormData] = useState<Partial<Exam1>>({
        name: '',
        exam_mode: '', // Set to empty string initially, will be populated by fetched data
        exam_time_selection: '', // Set to empty string initially
        exam_date: '',
        exam_time: '',
        exam_duration: 120, // Default value, will be overwritten
        exam_fee: 0, // Default value, will be overwritten
        exam_registrationEndDate: '',
        exam_category: '',
        exam_description: '',
        exam_prerequisites: '',
    });

    // State for location details, relevant only if exam_mode is 'offline'
    // Using a specific type for the state shape
    interface ExamLocationState {
        id?: string; // Include ID for existing locations
        name: string;
        total_seats: number;
        filled_seats?: number; // Include if backend returns this and you need it
        available_seats?: number; // <-- Added available_seats here
    }
    const [locations, setLocations] = useState<ExamLocationState[]>([]); // Initialize as empty array

    // State for frontend validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

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


    // --- Effect to fetch exam data on component mount or ID change ---
    useEffect(() => {
        const fetchExam = async () => {
            if (!id) {
                setFetchError("No exam ID provided.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true); // Start loading state
            setFetchError(null); // Clear previous errors

             // Get authentication token
             const token = localStorage.getItem('authToken'); // Adjust how you get your auth token
             if (!token) {
                 const authError = 'Authentication token not found. Please log in.';
                 console.error(authError);
                 setFetchError(authError);
                 setIsLoading(false);
                 // Optionally redirect to login
                 // navigate('/login');
                 return;
             }


            try {
                // --- Real API call to fetch exam details ---
                const response = await fetch(`${API_BASE_URL}/exam/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include auth token
                    },
                    credentials: 'include', // Include if needed
                });

                if (!response.ok) {
                     const errorBody = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                     console.error(`Failed to fetch exam ${id}:`, response.status, errorBody);
                     setFetchError(errorBody.error || `Failed to load exam data. Status: ${response.status}`);
                     return; // Stop processing on error
                }

                const result = await response.json();

                // Assuming your backend returns { examData: [examObject], examLocation: [locationObjects] }
                // And examData[0] contains the main exam details
                if (result.examData && result.examData.length > 0) {
                    const examData = result.examData[0];

                    // Set form data. Ensure dates are inYYYY-MM-DD format for input type="date"
                    // And time is in HH:MM or HH:MM:SS for input type="time"
                    setFormData({
                        name: examData.name || '',
                        exam_mode: examData.exam_mode || '',
                        exam_time_selection: examData.exam_time_selection || '',
                        // Convert date string from backend (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ") toYYYY-MM-DD
                        exam_date: examData.exam_date ? new Date(examData.exam_date).toISOString().split('T')[0] : '',
                        // Keep time as is if backend stores HH:MM or HH:MM:SS, or format if needed
                        exam_time: examData.exam_time || '',
                        exam_duration: examData.exam_duration ?? 120, // Use ?? for null/undefined check
                        exam_fee: examData.exam_fee ?? 0,
                        // Convert date string from backend toYYYY-MM-DD
                        exam_registrationEndDate: examData.exam_registrationEndDate ? new Date(examData.exam_registrationEndDate).toISOString().split('T')[0] : '',
                        exam_category: examData.exam_category || '',
                        exam_description: examData.exam_description || '',
                        exam_prerequisites: examData.exam_prerequisites || '',
                    });

                    // Set locations if available and exam mode is offline
                    if (examData.exam_mode === "offline" && result.examLocation && Array.isArray(result.examLocation)) {
                         // Map location data to match ExamLocationState type
                        setLocations(result.examLocation.map((loc: any) => ({
                            id: loc.id, // Keep existing location ID
                            name: loc.location || '', // Backend returns location as 'location' field
                            total_seats: loc.total_seats ?? 0,
                            filled_seats: loc.filled_seats ?? 0, // Include if needed
                            available_seats: loc.available_seats ?? 0, // <-- Map available_seats from backend if present
                        })));
                    } else {
                        // If online or no locations, ensure locations state is empty or default
                        setLocations([]);
                    }

                } else {
                    // Handle case where API returns OK but no exam data or unexpected format
                    const errorMessage = result.error || `Exam data for ID ${id} not found or invalid format.`;
                    console.error(errorMessage, result);
                    setFetchError(errorMessage);
                }

            } catch (error: any) {
                // Handle network errors
                console.error(`Error fetching exam ${id}:`, error);
                setFetchError(`An unexpected error occurred while loading exam data: ${error.message}.`);
            } finally {
                setIsLoading(false); // Stop loading state
            }
        };

        if (id) {
            fetchExam(); // Fetch data if ID is available
        } else {
            // Handle case where ID is missing from URL
            setFetchError("No exam ID provided in the URL.");
            setIsLoading(false);
        }
    }, [id, navigate]); // Re-run effect if ID changes or navigate function changes

    // Handle basic input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
         // Clear validation error for this field when it changes
         if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
         setSubmissionError(null); // Clear general submission error on input change
         setToasterMessage(null); // Clear toaster message on input change
    };

    // Handle location input changes (name and total_seats)
    const handleLocationChange = (index: number, field: keyof ExamLocationState, value: string | number) => {
        const updatedLocations = [...locations];
        // Ensure total_seats is parsed as an integer
        const safeValue = field === 'total_seats' ? parseInt(value as string, 10) : value;
        updatedLocations[index] = {
            ...updatedLocations[index],
            [field]: safeValue,
        };
        setLocations(updatedLocations);
        // Clear location specific validation error
         if (errors[`location_${index}_${String(field)}`]) {
             setErrors(prev => {
                 const newErrors = { ...prev };
                 delete newErrors[`location_${index}_${String(field)}`];
                 return newErrors;
             });
         }
         setSubmissionError(null); // Clear general submission error on input change
         setToasterMessage(null); // Clear toaster message on input change
    };

    // Add a new location field set to the locations state
    const addLocation = () => {
        // When adding a new location, it won't have an ID yet
        // Initialize available_seats to total_seats (0) for new locations
        setLocations([...locations, { name: '', total_seats: 0, available_seats: 0 }]);
    };

    // Remove a location field set from the locations state
    const removeLocation = (index: number) => {
        // Allow removing if more than one location exists OR if mode is not offline (locations are optional then)
        if (locations.length > (formData.exam_mode === 'offline' ? 1 : 0)) {
            const updatedLocations = [...locations];
            updatedLocations.splice(index, 1);
            setLocations(updatedLocations);
            // Clear any validation errors associated with the removed location
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`location_${index}_name`];
                delete newErrors[`location_${index}_total_seats`];
                // TODO: If necessary, adjust error keys for subsequent locations if indices change after splice
                return newErrors;
            });
        }
    };

     // --- Frontend Validation Logic ---
     const validateForm = (): Record<string, string> => {
        const newErrors: Record<string, string> = {};

        // Basic required fields validation
        if (!formData.name || !formData.name.trim()) newErrors.name = 'Exam Name is required';
        if (!formData.exam_category) newErrors.exam_category = 'Exam Category is required';
        if (!formData.exam_mode) newErrors.exam_mode = 'Exam Mode is required';
        if (!formData.exam_time_selection) newErrors.exam_time_selection = 'Time Selection is required';
        if (!formData.exam_date) newErrors.exam_date = 'Exam Date is required';

        // Duration validation
        const duration = Number(formData.exam_duration);
        if (formData.exam_duration === undefined || formData.exam_duration === null || isNaN(duration) || duration <= 0) newErrors.exam_duration = 'Duration must be a positive number';

        // Fee validation
        const fee = Number(formData.exam_fee);
        if (formData.exam_fee === undefined || formData.exam_fee === null || isNaN(fee) || fee < 0) newErrors.exam_fee = 'Fee cannot be negative or invalid';

        if (!formData.exam_registrationEndDate) newErrors.exam_registrationEndDate = 'Registration End Date is required';
        if (!formData.exam_description || !formData.exam_description.trim()) newErrors.exam_description = 'Exam Description is required';
        if (!formData.exam_prerequisites || !formData.exam_prerequisites.trim()) newErrors.exam_prerequisites = 'Prerequisites are required';


        // Conditional validation based on exam mode and time selection
        if (formData.exam_mode === 'offline') {
            // Validate locations for offline mode
            if (locations.length === 0) {
                newErrors.locations = 'At least one location is required for offline exams';
            } else {
                locations.forEach((loc, index) => {
                    if (!loc.name || !loc.name.trim()) newErrors[`location_${index}_name`] = `Location name ${index + 1} is required`;
                    const totalSeats = Number(loc.total_seats);
                    if (loc.total_seats === undefined || loc.total_seats === null || isNaN(totalSeats) || totalSeats <= 0) {
                        newErrors[`location_${index}_total_seats`] = `Total seats for location ${index + 1} must be a positive number`;
                    }
                     // Optional: Add validation for available_seats if needed (e.g., available <= total)
                     if (loc.available_seats !== undefined && loc.total_seats !== undefined && loc.available_seats > loc.total_seats) {
                         newErrors[`location_${index}_available_seats`] = `Available seats for location ${index + 1} cannot exceed total seats`;
                     }
                });
            }
        } else { // exam_mode is 'online'
            if (formData.exam_time_selection === 'fixed') {
                if (!formData.exam_time) {
                    newErrors.exam_time = 'Exam Time is required for fixed-time online exams';
                } else {
                    // Basic HH:MM or HH:MM:SS format check
                    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM format
                    const timePatternSeconds = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/; // HH:MM:SS format
                    if (!timePattern.test(formData.exam_time) && !timePatternSeconds.test(formData.exam_time)) {
                        newErrors.exam_time = 'Invalid time format (expected HH:MM or HH:MM:SS)';
                    }
                     // Note: Backend also validates the 08:00-17:00 range for online registration payload.
                     // We rely on backend for that range validation for fixed time data coming from DB,
                     // but could add it here for user input if desired.
                }
            }
            // For flexible online exams, exam_time input is not relevant for this form
        }

        setErrors(newErrors);
        return newErrors; // Return the errors object
    };


    // --- Handle form submission (Update Exam) ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // --- Frontend Validation ---
        const formValidationErrors = validateForm();
        if (Object.keys(formValidationErrors).length > 0) {
            console.log("Frontend validation failed.", formValidationErrors);
            // Errors are already set by validateForm() and should display on the form
            setSubmissionError("Please fix the errors in the form."); // Indicate validation failed generally
            setToasterMessage("Please fix the errors in the form.");
            setToasterType('error');
            return; // Stop submission
        }

        setSubmissionError(null); // Clear previous submission errors
        setToasterMessage(null); // Clear previous toaster messages
        setToasterType(null);
        setIsSubmitting(true);

        // Prepare the payload data for the backend's editExams endpoint
        // Ensure data types match backend schema (numbers for duration/fee/seats, string for others)
        const payload: any = { // Using 'any' for simplicity, ideally use a specific interface for update payload
            // Do NOT include 'id' in the body, it's in the URL params
            name: formData.name,
            exam_mode: formData.exam_mode,
            exam_time_selection: formData.exam_time_selection,
            exam_date: formData.exam_date, // SendYYYY-MM-DD format
            // Only include exam_time if it's a fixed online exam and the input is not empty
            // Send as HH:MM or HH:MM:SS string as typed by user.
            exam_time: formData.exam_time_selection === 'fixed' && formData.exam_time ? formData.exam_time : undefined,
            exam_duration: Number(formData.exam_duration), // Ensure number
            exam_fee: Number(formData.exam_fee), // Ensure number
            exam_registrationEndDate: formData.exam_registrationEndDate, // SendYYYY-MM-DD format
            exam_category: formData.exam_category,
            exam_description: formData.exam_description,
            exam_prerequisites: formData.exam_prerequisites,
            // Locations are added conditionally below
        };

        // Add locations to payload only for offline exams
        if (formData.exam_mode === 'offline') {
             // Map frontend location state to backend expected structure for update
             // Include ID for existing locations, omit for newly added ones (backend handles creation)
            payload.locations = locations.map(loc => ({
                id: loc.id, // Include ID if it exists
                name: loc.name,
                total_seats: Number(loc.total_seats), // Ensure number
                // filled_seats might be sent if backend update logic requires it,
                // but your editExams backend function only updates total_seats and filled_seats.
                // It seems to expect filled_seats in the update payload for locations.
                // Let's include it based on the backend code you provided for editExams.
                filled_seats: loc.filled_seats ?? 0, // Include filled_seats from state
            }));
        } else {
            // If switching from offline to online, backend delete logic handles removing locations.
            // We can explicitly send an empty locations array or omit the field,
            // but the backend logic seems to rely on the exam_mode change to trigger deletion.
            // Let's omit locations if online mode, backend handles deleting old ones.
            // If backend *required* an empty array to signal deletion, we'd add:
            // payload.locations = [];
        }

        // Get authentication token
        const token = localStorage.getItem('authToken'); // Adjust how you get your auth token
        if (!token) {
            const authError = 'Authentication token not found. Please log in.';
            setSubmissionError(authError);
            setToasterMessage(authError);
            setToasterType('error');
            setIsSubmitting(false);
            // navigate('/login');
            return;
        }

        // --- Real API Call to Backend (PUT request) ---
        try {
            const response = await fetch(`${API_BASE_URL}/exam/${id}`, {
                method: 'PUT', // Use PUT method for updates
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Include auth token
                },
                credentials: 'include', // Include if needed
                body: JSON.stringify(payload),
            });

            // Check for non-OK response status (4xx, 5xx)
            if (!response.ok) {
                 const errorBody = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                 console.error('Exam update failed:', response.status, errorBody);
                 const errorMessage = errorBody.error || `Failed to update exam. Status: ${response.status}`;
                 setSubmissionError(errorMessage);
                 setToasterMessage(errorMessage);
                 setToasterType('error');
                 // Do NOT navigate on error
                 return; // Stop processing
            }

            // Parse successful response (assuming backend returns 200 status and { message: ... } or similar)
            // Your backend editExams returns 200 with { message: "Exam updated successfully" }
            const result = await response.json();

            console.log('Exam updated successfully:', result.message);

            // --- Trigger Success Toaster ---
            setToasterMessage(result.message || 'Exam updated successfully!');
            setToasterType('success');
            // ---------------------------------

            // Redirect to exams list after a short delay to show the toaster message
            setTimeout(() => {
                 navigate('/admin/exams');
            }, 2000); // 2-second delay

        } catch (error: any) {
            // Handle network errors or issues before a response is received
            console.error('Error during exam update fetch:', error);
             const errorMessage = `An unexpected error occurred during update: ${error.message}. Please check your network connection.`;
             setSubmissionError(errorMessage);
             // --- Trigger Error Toaster ---
             setToasterMessage(errorMessage);
             setToasterType('error');
             // -----------------------------
             // Do NOT navigate on error
        } finally {
            setIsSubmitting(false); // Stop loading state
        }
    };


    // --- Render Logic ---
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-900" /> {/* Use Loader2 icon */}
                <p className="ml-2 text-gray-600">Loading exam data...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">{fetchError}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/admin/exams')}
                >
                    Back to Exams List
                </Button>
            </div>
        );
    }

    // If not loading and no fetch error, render the form
    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6">
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

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Exam</h1>
                 <Button variant="outline" onClick={() => navigate('/admin/exams')}>
                    Cancel
                 </Button>
            </div>

            {/* submissionError is now also shown in toaster, but can keep this for persistent error message if needed */}
            {/* {submissionError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{submissionError}</span>
                </div>
            )} */}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-medium">Exam Details</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Exam Name */}
                            <div>
                                <Input
                                    label="Exam Name"
                                    name="name"
                                    value={formData.name || ''} // Ensure value is never undefined/null for controlled input
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Exam Category */}
                            <div>
                                <Select
                                    label="Exam Category"
                                    name="exam_category"
                                    value={formData.exam_category || ''}
                                    onChange={handleInputChange}
                                    options={[
                                        { value: '', label: 'Select a category' },
                                        { value: 'Mathematics', label: 'Mathematics' },
                                        { value: 'Physics', label: 'Physics' },
                                        { value: 'Chemistry', label: 'Chemistry' },
                                        { value: 'Biology', label: 'Biology' },
                                        { value: 'Computer Science', label: 'Computer Science' },
                                        { value: 'English', label: 'English' },
                                        { value: 'History', label: 'History' },
                                        { value: 'Geography', label: 'Geography' },
                                    ]}
                                    required
                                />
                                {errors.exam_category && <p className="text-red-500 text-sm mt-1">{errors.exam_category}</p>}
                            </div>

                            {/* Exam Mode */}
                            <div>
                                <Select
                                    label="Exam Mode"
                                    name="exam_mode"
                                    value={formData.exam_mode || ''}
                                    onChange={handleInputChange}
                                    options={[
                                        { value: '', label: 'Select mode' },
                                        { value: 'online', label: 'Online' },
                                        { value: 'offline', label: 'Offline' },
                                    ]}
                                    required
                                />
                                {errors.exam_mode && <p className="text-red-500 text-sm mt-1">{errors.exam_mode}</p>}
                            </div>

                            {/* Time Selection */}
                             <div>
                                <Select
                                    label="Time Selection"
                                    name="exam_time_selection"
                                    value={formData.exam_time_selection || ''}
                                    onChange={handleInputChange}
                                    options={[
                                         { value: '', label: 'Select time selection' },
                                        { value: 'fixed', label: 'Fixed Time' },
                                        { value: 'flexible', label: 'Flexible Time' },
                                    ]}
                                    required
                                />
                                {errors.exam_time_selection && <p className="text-red-500 text-sm mt-1">{errors.exam_time_selection}</p>}
                            </div>

                            {/* Exam Date */}
                            <div>
                                <Input
                                    label="Exam Date"
                                    type="date"
                                    name="exam_date"
                                    value={formData.exam_date || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.exam_date && <p className="text-red-500 text-sm mt-1">{errors.exam_date}</p>}
                            </div>

                            {/* Exam Time (Conditionally rendered for fixed online) */}
                            {formData.exam_time_selection === 'fixed' && (
                                <div>
                                    <Input
                                        label="Exam Time"
                                        type="time"
                                        name="exam_time"
                                        value={formData.exam_time || ''}
                                        onChange={handleInputChange}
                                        required={formData.exam_time_selection === 'fixed'}
                                    />
                                    {errors.exam_time && <p className="text-red-500 text-sm mt-1">{errors.exam_time}</p>}
                                </div>
                            )}

                            {/* Exam Duration */}
                            <div>
                                <Input
                                    label="Exam Duration (minutes)"
                                    type="number"
                                    name="exam_duration"
                                    value={formData.exam_duration ?? ''} // Use ?? '' to handle 0 correctly as a valid number
                                    onChange={handleInputChange}
                                    required
                                    min={1}
                                />
                                {errors.exam_duration && <p className="text-red-500 text-sm mt-1">{errors.exam_duration}</p>}
                            </div>

                            {/* Exam Fee */}
                            <div>
                                <Input
                                    label="Exam Fee ($)"
                                    type="number"
                                    name="exam_fee"
                                    value={formData.exam_fee ?? ''} // Use ?? '' to handle 0 correctly
                                    onChange={handleInputChange}
                                    required
                                    min={0}
                                    step={0.01}
                                />
                                {errors.exam_fee && <p className="text-red-500 text-sm mt-1">{errors.exam_fee}</p>}
                            </div>

                            {/* Registration End Date */}
                            <div>
                                <Input
                                    label="Registration End Date"
                                    type="date"
                                    name="exam_registrationEndDate"
                                    value={formData.exam_registrationEndDate || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.exam_registrationEndDate && <p className="text-red-500 text-sm mt-1">{errors.exam_registrationEndDate}</p>}
                            </div>
                        </div>

                        {/* Exam Description */}
                        <div>
                            <Textarea
                                label="Exam Description"
                                name="exam_description"
                                value={formData.exam_description || ''}
                                onChange={handleInputChange}
                                rows={4}
                                required
                            />
                            {errors.exam_description && <p className="text-red-500 text-sm mt-1">{errors.exam_description}</p>}
                        </div>

                        {/* Prerequisites */}
                        <div>
                             <Textarea
                                label="Prerequisites"
                                name="exam_prerequisites"
                                value={formData.exam_prerequisites || ''}
                                onChange={handleInputChange}
                                rows={3}
                                required
                             />
                             {errors.exam_prerequisites && <p className="text-red-500 text-sm mt-1">{errors.exam_prerequisites}</p>}
                        </div>

                        {/* Locations section for offline exams */}
                        {formData.exam_mode === 'offline' && (
                            <div className="mt-6">
                                <h3 className="text-md font-medium mb-3">Exam Locations</h3>
                                {errors.locations && <p className="text-red-500 text-sm mb-3">{errors.locations}</p>}

                                {locations.map((location, index) => (
                                    <div key={location.id || index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                                        {/* Location Name */}
                                        <div>
                                            <Input
                                                label="Location Name"
                                                value={location.name || ''}
                                                onChange={(e) => handleLocationChange(index, 'name', e.target.value)}
                                                required
                                            />
                                            {errors[`location_${index}_name`] && <p className="text-red-500 text-sm mt-1">{errors[`location_${index}_name`]}</p>}
                                        </div>

                                        {/* Total Seats */}
                                        <div>
                                             <Input
                                                label="Total Seats"
                                                type="number"
                                                value={location.total_seats ?? ''} // Use ?? '' to handle 0 correctly
                                                onChange={(e) => handleLocationChange(index, 'total_seats', parseInt(e.target.value, 10))}
                                                required
                                                min={1}
                                            />
                                             {errors[`location_${index}_total_seats`] && <p className="text-red-500 text-sm mt-1">{errors[`location_${index}_total_seats`]}</p>}
                                        </div>

                                        {/* Filled Seats (Display only, typically not editable here) */}
                                        {/* Added check for available_seats error */}
                                        {(location.filled_seats !== undefined && location.filled_seats !== null) && (
                                             <div>
                                                <Input
                                                    label="Filled Seats"
                                                    type="number"
                                                    value={location.filled_seats}
                                                    disabled // Filled seats is usually not editable directly
                                                    className="bg-gray-100 cursor-not-allowed"
                                                />
                                                {errors[`location_${index}_available_seats`] && <p className="text-red-500 text-sm mt-1">{errors[`location_${index}_available_seats`]}</p>}
                                             </div>
                                        )}


                                        {/* Add/Remove Location Buttons */}
                                        <div className="flex items-end mb-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeLocation(index)}
                                                disabled={locations.length <= (formData.exam_mode === 'offline' ? 1 : 0)} // Disable remove if only one location left for offline
                                                className="mr-2"
                                            >
                                                <Minus size={16} />
                                            </Button>

                                            {/* Show Add button only on the last location row when exam mode is offline */}
                                            {index === locations.length - 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addLocation}
                                                >
                                                    <Plus size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {/* Show Add button if no locations are present and mode is offline */}
                                {locations.length === 0 && formData.exam_mode === 'offline' && (
                                     <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addLocation}
                                     >
                                        Add Location <Plus size={16} className="ml-1"/>
                                     </Button>
                                )}
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-end"> {/* Adjusted to justify-end */}
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Exam'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default EditExamForm;
