import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Removed axios import, using native fetch
import { Search, Filter, Calendar, Clock, MapPin, DollarSign, Info, CheckCircle, ArrowLeft, Loader2,AlertCircle } from 'lucide-react'; // Assuming lucide-react for icons

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your base URL is different

// --- Type Definitions ---

// Represents the structure of an exam object received from the backend API list endpoint
interface ApiExam {
    id: string;
    name: string; // This is the exam name in the API response
    exam_mode: 'offline' | 'online';
    exam_time_selection: 'fixed' | 'flexible';
    exam_date: string; // ISO Date string (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ")
    exam_time: string; // Time string (e.g., "HH:MM:SS")
    exam_duration: string; // In minutes (string or number based on API)
    exam_fee: string; // String, likely needs parsing to number for display
    exam_registrationEndDate: string; // ISO Date string
    exam_category: string;
    exam_description: string;
    exam_prerequisites: string;
    exam_createdAt: string; // ISO Date string
    // Backend API list might include these for display purposes:
    locations?: { location: string; total_seats: number; filled_seats: number }[]; // Array of location objects for offline
    total_seats?: number; // Total seats if available at exam level
    filled_seats?: number; // Filled seats if available at exam level
}

// Internal Exam type used in the frontend state, with formatted fields
interface Exam extends Omit<ApiExam, 'name'> {
    name: string; // Keep name as string
    // Calculated/Formatted fields for display
    formattedDate: string; //YYYY-MM-DD
    formattedRegistrationEndDate: string; //YYYY-MM-DD
    formattedTime: string; // HH:MM (for display)
    availableSeats?: number; // Calculated available seats for list view
    // Keep the original locations data if available for step 2 rendering
    locations?: { location: string; total_seats: number; filled_seats: number }[];
}

// Represents the data collected from the user in the registration form
interface UserFormData {
    name: string;
    email: string;
    phone: string;
    dob: string; // Date of birth, collected but not sent in this specific payload based on backend code
    locationPreferences: string[]; // Array of selected location *names* for offline
    selectedExamTime: string;     // Selected time string (HH:MM) for online flexible
}

// Represents the payload structure expected by the backend /register endpoint
interface RegistrationPayload {
    email: string;
    exam_id: string;
    exam_mode: 'offline' | 'online';
    locationPreferences?: string[]; // Required for offline
    selected_exam_time?: string;     // Required for online (HH:MM:SS format)
}

// Represents the structure of the success response from the backend /register endpoint
interface RegistrationResponse {
    success: boolean;
    message: string;
    seatNumber?: number; // For offline success
    location?: string; // For offline success
    selected_exam_time?: string; // For online success (backend might echo it)
    application_id?: string; // Crucial for navigation to status page
    error?: string; // For backend-specific errors returned in a success-like structure
}

// Helper Function: Format ISO date string toYYYY-MM-DD
const formatDate = (isoString: string | null | undefined): string => {
    if (!isoString) return 'N/A';
    try {
        // Create Date object from ISO string
        const date = new Date(isoString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        // Format toYYYY-MM-DD
        return date.toISOString().split('T')[0];
    } catch (e) {
        console.error("Error formatting date:", isoString, e);
        return 'Invalid Date';
    }
};

// Helper Function: Format time string (HH:MM:SS) to HH:MM for display
const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return 'N/A';
    // Assuming time is HH:MM:SS, display HH:MM
    // Split by ':' and take the first two parts, then join. Handle potential errors.
    const parts = timeString.split(':');
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
    return 'Invalid Time';
}

// --- Component ---
const ExamRegistration1 = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preselectedExamId = queryParams.get('examId'); // Get preselected exam ID from URL

    const [allExams, setAllExams] = useState<Exam[]>([]); // List of all available exams
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null); // The exam the user is registering for

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(''); // Filter byYYYY-MM-DD

    // Loading and Error states
    const [isLoading, setIsLoading] = useState(true); // Initial fetch loading
    const [fetchError, setFetchError] = useState<string | null>(null); // Error fetching exams
    const [isSubmitting, setIsSubmitting] = useState(false); // Form submission loading
    const [submissionError, setSubmissionError] = useState<string | null>(null); // Error during submission

    // Toaster notification state
    const [toasterMessage, setToasterMessage] = useState<string | null>(null);
    const [toasterType, setToasterType] = useState<'success' | 'error' | null>(null);


    // Form data state
    const [formData, setFormData] = useState<UserFormData>({
        name: '', // Consider fetching from user context if available
        email: '', // Pre-filled from local storage
        phone: '',
        dob: '', // Date of birth, collected but not sent in current backend payload
        locationPreferences: [], // Array of selected location names for offline
        selectedExamTime: '', // Selected time (HH:MM) for online flexible
    });

    // Form validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Multi-step form state
    const [step, setStep] = useState(1); // 1: Exam List, 2: Registration Form

    // --- Fetch Exams and Pre-fill Email ---
    useEffect(() => {
        const fetchExamsAndPreFillEmail = async () => {
            setIsLoading(true);
            setFetchError(null); // Clear previous fetch errors

            // --- Attempt to pre-fill email from local storage ---
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user && user.email) {
                    // Only pre-fill if the email field in formData is currently empty
                    setFormData(prev => {
                        if (!prev.email) {
                            return { ...prev, email: user.email };
                        }
                        return prev; // Keep existing email if already set
                    });
                }
            } catch (e) {
                console.error("Error reading user data from local storage:", e);
                // Continue without pre-filling email
            }


            // --- Fetch Exams ---
            try {
                // Fetch exams using native fetch
                const response = await fetch(`${API_BASE_URL}/exam/`, {
                     method: 'GET', // Explicitly set method
                     headers: {
                         'Content-Type': 'application/json', // Standard header
                         // Add authorization header if needed, e.g., 'Authorization': `Bearer ${token}`
                     },
                     // Include credentials if your backend uses cookies/sessions for auth
                    credentials: 'include',
                });

                // Check if the response is OK (status code 200-299)
                if (!response.ok) {
                     // Attempt to parse error body, but handle potential parsing errors
                     const errorBody = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                     console.error(`Failed to fetch exams: ${response.status}`, errorBody);
                     setFetchError(errorBody.error || `Failed to fetch exams: ${response.status}`);
                     setAllExams([]); // Ensure exams list is empty on failure
                     return; // Stop processing on error
                }

                // Parse the JSON response body
                const result = await response.json();

                if (result.success && result.data) {
                    // Map backend API data to frontend Exam type, adding formatted fields
                    const formattedExams = result.data.map((exam: ApiExam): Exam => {
                         // Calculate available seats for display in the list
                         let availableSeats: number | undefined = undefined;
                         let totalSeats: number | undefined = undefined;

                         if (exam.exam_mode === 'offline' && exam.locations && exam.locations.length > 0) {
                             // Sum seats across all locations for this exam if location details are provided
                             totalSeats = exam.locations.reduce((sum, loc) => sum + (loc.total_seats || 0), 0);
                             const filled = exam.locations.reduce((sum, loc) => sum + (loc.filled_seats || 0), 0);
                             availableSeats = totalSeats - filled;
                         } else if (exam.total_seats !== undefined && exam.filled_seats !== undefined) {
                             // Or use total/filled directly if provided at the exam level
                             totalSeats = exam.total_seats;
                             availableSeats = exam.total_seats - exam.filled_seats;
                         }
                         // Note: If the API doesn't provide seat info in the list, availableSeats will remain undefined.

                        return {
                            ...exam,
                            name: exam.name, // Use the direct name property from API
                            formattedDate: formatDate(exam.exam_date),
                            formattedRegistrationEndDate: formatDate(exam.exam_registrationEndDate),
                            formattedTime: formatTime(exam.exam_time), // Format time for display
                            availableSeats: availableSeats, // Assign calculated value
                            total_seats: totalSeats, // Keep total seats if calculated/provided
                            // Keep the original locations array if present for Step 2 rendering
                            locations: exam.locations,
                        };
                    });

                    // Filter out exams whose registration deadline has passed
                    const futureExams = formattedExams.filter(exam => {
                         try {
                             const registrationEndDate = new Date(exam.exam_registrationEndDate);
                             // Check if the date is valid and is in the future or today
                             return !isNaN(registrationEndDate.getTime()) && registrationEndDate >= new Date();
                         } catch (e) {
                             console.error("Error parsing registration end date:", exam.exam_registrationEndDate, e);
                             return false; // Exclude if date is invalid
                         }
                    });

                    setAllExams(futureExams);

                    // Handle preselection AFTER exams are loaded and filtered
                    if (preselectedExamId) {
                        const examToSelect = futureExams.find(e => e.id === preselectedExamId);
                        if (examToSelect) {
                            handleExamSelect(examToSelect); // Use the selection handler to move to step 2
                        } else {
                             console.warn(`Preselected exam ID ${preselectedExamId} not found or registration closed.`);
                             // Optionally display a message to the user
                        }
                    }

                } else {
                    // Handle API success: false or missing data property
                    setFetchError(result.error || 'Failed to fetch exams.');
                    setAllExams([]); // Ensure exams list is empty on failure
                }
            } catch (error: any) {
                // Handle network errors or issues *before* a response is received
                console.error("Error fetching exams:", error);
                setFetchError('An unexpected error occurred while fetching exams. Please try again later.');
                setAllExams([]); // Ensure exams list is empty on critical failure
            } finally {
                setIsLoading(false); // Always stop loading
            }
        };

        fetchExamsAndPreFillEmail();
        // Rerun effect if preselectedExamId changes or navigate changes
    }, [preselectedExamId, navigate]);

    // Effect to automatically hide the toaster message after a few seconds
    useEffect(() => {
        if (toasterMessage) {
            const timer = setTimeout(() => {
                setToasterMessage(null);
                setToasterType(null);
            }, 5000); // Hide after 5 seconds

            return () => clearTimeout(timer); // Clean up the timer
        }
    }, [toasterMessage]); // Rerun effect when toasterMessage changes


    // --- Derived State: Categories (Memoized) ---
    const categories = useMemo(() => {
        // Extract unique categories from the fetched exams
        return [...new Set(allExams.map(exam => exam.exam_category))];
    }, [allExams]); // Recalculate only when allExams changes

    // --- Derived State: Filtered Exams (Memoized) ---
    const filteredExams = useMemo(() => {
        // Apply search and filter criteria to the list of exams
        return allExams.filter(exam => {
            // Check if exam name or description includes the search term (case-insensitive)
            const matchesSearch = searchTerm ? exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 exam.exam_description.toLowerCase().includes(searchTerm.toLowerCase()) : true;

            // Check if the exam category matches the selected filter (or no filter is selected)
            const matchesCategory = categoryFilter ? exam.exam_category === categoryFilter : true;

            // Check if the exam date matches the selected date filter (or no filter is selected)
            // Compare formatted dates (YYYY-MM-DD)
            const matchesDate = dateFilter ? exam.formattedDate === dateFilter : true;

            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [allExams, searchTerm, categoryFilter, dateFilter]); // Recalculate when dependencies change


    // --- Event Handlers ---

    // Handles selecting an exam from the list
    const handleExamSelect = (exam: Exam) => {
        setSelectedExam(exam); // Set the selected exam
        setErrors({}); // Clear any previous form errors
        setSubmissionError(null); // Clear any previous submission errors
        setToasterMessage(null); // Clear any existing toaster message when selecting a new exam

        // Reset specific form fields when selecting a new exam, but keep user details
        setFormData(prev => ({
             ...prev, // Keep user details like name, email, phone, dob
             locationPreferences: [], // Clear location preferences
             // Pre-fill selectedExamTime for fixed online exams, otherwise clear it
             selectedExamTime: exam.exam_mode === 'online' && exam.exam_time_selection === 'fixed'
                               ? formatTime(exam.exam_time) // Use formatted time (HH:MM) for form input
                               : '' // Clear for offline or flexible online
        }));
        setStep(2); // Move to the registration form step
    };

    // Handles changes in standard input/select/textarea fields
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target; // Get name and value from the input

        setFormData(prev => ({
            ...prev,
            [name]: value // Update the corresponding field in formData
        }));

        // Clear the specific field's error message when the user starts typing/changing it
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name]; // Remove the error for this field
                return newErrors;
            });
        }
        setSubmissionError(null); // Clear any general submission error on form change
        setToasterMessage(null); // Clear toaster message on form change
    };

     // Handles changes for location preference checkboxes (for offline exams)
     const handleLocationPreferenceChange = (e: ChangeEvent<HTMLInputElement>) => {
         const { value, checked } = e.target; // Get the location name (value) and checked status

         setFormData(prev => {
             const currentPrefs = prev.locationPreferences;
             if (checked) {
                 // Add location name to preferences if checked
                 return { ...prev, locationPreferences: [...currentPrefs, value] };
             } else {
                 // Remove location name from preferences if unchecked
                 return { ...prev, locationPreferences: currentPrefs.filter(loc => loc !== value) };
             }
         });

         // Clear the location preferences error message if it exists
         if (errors.locationPreferences) {
             setErrors(prev => ({ ...prev, locationPreferences: '' }));
         }
         setToasterMessage(null); // Clear toaster message on form change
     };


    // --- Form Validation ---
    // Validates the form data before submission based on the selected exam's mode
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!selectedExam) return false; // Should not happen if step is 2, but good check

        // Basic validation for common fields
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'; // Simple email regex
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        // Basic 10-digit phone format check (adjust regex as needed for international formats)
        else if (!/^\d{10}$/.test(formData.phone.replace(/\s+/g, ''))) newErrors.phone = 'Phone number must be 10 digits';
        // Note: DOB is collected but not validated/sent based on the provided backend code


        // Mode-specific validation based on backend requirements
        if (selectedExam.exam_mode === 'offline') {
            // For offline exams, location preferences are required
            if (formData.locationPreferences.length === 0) {
                newErrors.locationPreferences = 'Please select at least one location preference.';
            }
        } else if (selectedExam.exam_mode === 'online' && selectedExam.exam_time_selection !== 'fixed') {
            // For online flexible exams, a time selection is required and must be validated
            if (!formData.selectedExamTime) {
                newErrors.selectedExamTime = 'Please select an exam time.';
            } else {
                 // Validate time format HH:MM and the backend's allowed range (08:00 to 17:00)
                 const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM format regex
                 if(!timePattern.test(formData.selectedExamTime)) {
                     newErrors.selectedExamTime = 'Invalid time format (HH:MM).'
                 } else {
                      const [hours, minutes] = formData.selectedExamTime.split(':').map(Number);
                      // Backend range is 8:00 AM up to (but not including) 5:00 PM (17:00)
                      if (hours < 8 || hours >= 17) {
                          newErrors.selectedExamTime = 'Exam time must be between 08:00 AM and 4:59 PM.';
                      }
                 }
            }
        }
        // Note: For online fixed exams, no time validation is needed as the time is fixed by the exam itself.

        setErrors(newErrors); // Update the errors state
        // Return true if there are no errors, false otherwise
        return Object.keys(newErrors).length === 0;
    };

    // --- Form Submission ---
    // Handles the submission of the registration form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // Prevent default form submission and page reload

        // Validate the form before attempting submission
        if (!selectedExam || !validateForm()) {
            console.log("Validation Failed or No Exam Selected", errors); // This log indicates validation failed
            // Validation errors are already set by validateForm() and should be visible on the form
            return; // Stop submission if validation fails
        }

        setIsSubmitting(true); // Start submission loading state
        setSubmissionError(null); // Clear any previous submission errors
        setToasterMessage(null); // Clear any existing toaster message before new submission


        // Construct the payload based on the backend's expected structure
        const registrationData: RegistrationPayload = {
            email: formData.email,
            exam_id: selectedExam.id,
            exam_mode: selectedExam.exam_mode,
        };

        if (selectedExam.exam_mode === 'offline') {
            // Include locationPreferences only for offline exams
            registrationData.locationPreferences = formData.locationPreferences;
        } else { // Online exams
            // Include selected_exam_time for online exams
            // Send the fixed time (HH:MM:SS) if time selection is fixed,
            // otherwise send the user-selected time (HH:MM) with ":00" appended
            registrationData.selected_exam_time = selectedExam.exam_time_selection === 'fixed'
                ? selectedExam.exam_time // Use the full HH:MM:SS from the exam data
                : `${formData.selectedExamTime}:00`; // Append :00 to user selected HH:MM
        }

        try {
            // Send the registration data to the backend API using native fetch
             // IMPORTANT: Ensure the URL '/examRegistration/register' is correct
             console.log(registrationData);
            const response = await fetch(`${API_BASE_URL}/examRegistration/register`, {
                 method: 'POST', // Set method to POST
                 headers: {
                     'Content-Type': 'application/json', // Indicate that the body is JSON
                     // Add authorization header if needed, e.g., 'Authorization': `Bearer ${token}`
                 },
                 // Include credentials if needed
                 credentials: 'include',
                 // Stringify the JSON payload for the body
                 body: JSON.stringify(registrationData),
            });

            // Check if the response is OK (status code 200-299)
            if (!response.ok) {
                 // Handle non-OK responses (e.g., 400, 500)
                 // Attempt to parse error body, but handle potential parsing errors
                 const errorBody = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                 console.error(`Submission failed: ${response.status}`, errorBody);

                 const backendError = errorBody.error; // Get the error message from the backend response body
                 setSubmissionError(backendError || `Registration failed with status: ${response.status}`);

                 // Optionally, map specific backend error messages to frontend form errors
                 if (backendError?.includes("already registered")) {
                      setErrors(prev => ({...prev, form: "You are already registered for this exam."})); // Add a general form error
                 } else if (backendError?.includes("No seats available")) {
                      setErrors(prev => ({...prev, locationPreferences: "No seats available in preferred locations. Try selecting others or check later."})); // Add error to location field
                 } else if (backendError?.includes("Selected exam time is required")) {
                      setErrors(prev => ({...prev, selectedExamTime: "Please select an exam time."})); // Add error to time field
                 } else if (backendError?.includes("Exam time must be between")) {
                      setErrors(prev => ({...prev, selectedExamTime: backendError})); // Use backend's specific time error
                 }
                 // Add more specific error mappings as needed based on backend messages

                 // Set toaster for error
                 setToasterMessage(backendError || `Registration failed with status: ${response.status}`);
                 setToasterType('error');

                 return; // Stop processing on error
            }

            // Parse the JSON response body on success
            const result: RegistrationResponse = await response.json();

            if (result.success) {
                // Registration was successful
                const applicationId = result.application_id;

                // Set toaster for success
                setToasterMessage(result.message || 'Registration successful!');
                setToasterType('success');

                if (applicationId) {
                    // Navigate to the status page using the application ID after a short delay
                    // to allow the toaster to be seen
                    setTimeout(() => {
                        navigate(`/status/${applicationId}`);
                    }, 2000); // Navigate after 2 seconds
                } else {
                    // Fallback if backend doesn't return application_id (shouldn't happen based on backend code)
                    console.warn("Backend did not return application_id. Registration successful, but cannot navigate to status page.");
                    // Stay on the current page and let the toaster show success
                    resetSelection(); // Maybe go back to exam list after success? Depends on desired flow.
                }
            } else {
                 // Handle backend returning success: false in the body (less common with 200 status, but possible)
                 setSubmissionError(result.error || 'Registration failed. Please try again.');
                 // Set toaster for error
                 setToasterMessage(result.error || 'Registration failed. Please try again.');
                 setToasterType('error');
            }
        } catch (error: any) {
            // Handle network errors or issues *before* a response is received (e.g., server is down)
            console.error("Error submitting registration:", error);
            const errorMessage = 'An unexpected error occurred during registration. Please check your network connection.';
            setSubmissionError(errorMessage);
            // Set toaster for error
            setToasterMessage(errorMessage);
            setToasterType('error');
        } finally {
            setIsSubmitting(false); // Always stop submission loading state
        }
    };

    // --- Reset ---
    // Resets the selected exam and steps back to the exam list
    const resetSelection = () => {
        setSelectedExam(null); // Clear selected exam
        setStep(1); // Go back to step 1 (exam list)
        setErrors({}); // Clear validation errors
        setSubmissionError(null); // Clear submission errors
        setToasterMessage(null); // Clear toaster message
        setToasterType(null); // Clear toaster type
        // Optionally clear form data here if you don't want user details to persist
        // setFormData({ name: '', email: '', phone: '', dob: '', locationPreferences: [], selectedExamTime: '' });
    };

    // --- Render Logic ---

    // Show loading spinner while fetching exams
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                <p className="ml-4 text-gray-600">Loading exams...</p>
            </div>
        );
    }

    // Show fetch error message if fetching failed
    if (fetchError) {
        return (
            <div className="max-w-6xl mx-auto p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
                <h2 className="font-bold text-lg mb-2">Error Loading Exams</h2>
                <p>{fetchError}</p>
                <button
                    onClick={() => window.location.reload()} // Simple refresh to retry
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Main component render
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6"> {/* Added some padding */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Exam Registration</h1>

            {/* Step 1: Exam List & Filters */}
            {step === 1 && (
                <>
                    {/* Search and Filters Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                         <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                   type="text"
                                   placeholder="Search exams by name or description..."
                                   className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                   value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Filter Dropdowns */}
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                {/* Category Filter */}
                                <div className="relative">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <Filter className="h-4 w-4 text-gray-400" />
                                   </div>
                                   <select
                                       className="pl-10 pr-8 py-2 w-full sm:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                       value={categoryFilter}
                                       onChange={(e) => setCategoryFilter(e.target.value)}
                                   >
                                       <option value="">All Categories</option>
                                       {categories.map(category => (
                                           <option key={category} value={category}>{category}</option>
                                       ))}
                                   </select>
                                    {/* Custom arrow for select */}
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>

                                {/* Date Filter */}
                                <div className="relative">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <Calendar className="h-4 w-4 text-gray-400" />
                                   </div>
                                   <input
                                       type="date" // UsesYYYY-MM-DD format
                                       className="pl-10 pr-4 py-2 w-full sm:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                       value={dateFilter}
                                       onChange={(e) => setDateFilter(e.target.value)}
                                   />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exam List Section */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-700">Available Exams</h2>
                            <p className="text-gray-500 mt-1">Select an exam to register</p>
                        </div>

                        {/* Display filtered exams or a "not found" message */}
                        {filteredExams.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {filteredExams.map(exam => (
                                    <div key={exam.id} className="p-6 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                            {/* Exam Details */}
                                            <div className="mb-4 md:mb-0 md:pr-6 flex-1">
                                                <h3 className="text-lg font-medium text-gray-900">{exam.name}</h3>
                                                <p className="text-gray-600 mt-1 text-sm">{exam.exam_description}</p>

                                                {/* Exam Info Icons */}
                                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                                                    <div className="inline-flex items-center text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4 mr-1.5 text-indigo-500" />
                                                        {exam.formattedDate}
                                                    </div>
                                                    <div className="inline-flex items-center text-sm text-gray-500">
                                                        <Clock className="h-4 w-4 mr-1.5 text-indigo-500" />
                                                        {exam.formattedTime} ({exam.exam_duration} mins)
                                                    </div>
                                                    <div className="inline-flex items-center text-sm text-gray-500">
                                                        <MapPin className="h-4 w-4 mr-1.5 text-indigo-500" />
                                                        {exam.exam_mode === 'offline' ? 'Offline Centers' : 'Online'}
                                                    </div>
                                                    <div className="inline-flex items-center text-sm text-gray-500">
                                                        <DollarSign className="h-4 w-4 mr-1.5 text-indigo-500" />
                                                        ₹{parseFloat(exam.exam_fee).toFixed(2)} {/* Assuming currency */}
                                                    </div>
                                                </div>

                                                {/* Registration Deadline */}
                                                <div className="mt-2 text-sm">
                                                    <span className="text-gray-500">Registration closes: </span>
                                                    <span className="font-medium text-amber-600">{exam.formattedRegistrationEndDate}</span>
                                                </div>
                                                {/* Prerequisites */}
                                                 {exam.exam_prerequisites && (
                                                    <div className="mt-1 text-sm text-gray-600">
                                                        Prerequisites: {exam.exam_prerequisites}
                                                    </div>
                                                 )}
                                            </div>

                                            {/* Seats & Action */}
                                            <div className="flex flex-col items-center mt-4 md:mt-0 md:w-40 flex-shrink-0">
                                                {/* Display Available Seats ONLY if calculated */}
                                                {exam.availableSeats !== undefined && exam.total_seats !== undefined ? (
                                                    <div className="text-center mb-3">
                                                         <div className="text-sm text-gray-500">Available Seats</div>
                                                         <div className={`text-2xl font-bold ${exam.availableSeats > 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                                                             {exam.availableSeats}/{exam.total_seats}
                                                         </div>
                                                    </div>
                                                ) : (
                                                     // Fallback if seat info isn't available in the list data
                                                    <div className="text-center mb-3">
                                                         <div className="text-sm text-gray-500">Availability</div>
                                                         <div className="text-lg font-bold text-indigo-600">-</div> {/* Or a loading/info icon */}
                                                    </div>
                                                )}


                                                {/* Select/Register Button */}
                                                <button
                                                    onClick={() => handleExamSelect(exam)}
                                                    // Disable if seats are known and zero, or registration deadline is past
                                                    disabled={(exam.availableSeats !== undefined && exam.availableSeats <= 0) || new Date(exam.exam_registrationEndDate) < new Date()}
                                                    className={`w-full px-6 py-2 text-white font-medium rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                                         ((exam.availableSeats !== undefined && exam.availableSeats <= 0) || new Date(exam.exam_registrationEndDate) < new Date())
                                                         ? 'bg-gray-400 cursor-not-allowed'
                                                         : 'bg-indigo-600 hover:bg-indigo-700'
                                                    }`}
                                                >
                                                    {/* Button text based on availability/deadline */}
                                                    { new Date(exam.exam_registrationEndDate) < new Date() ? 'Registration Closed' :
                                                      (exam.availableSeats !== undefined && exam.availableSeats <= 0) ? 'Seats Full' : 'Select & Register'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             // Message when no exams match filters
                            <div className="p-8 text-center">
                                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No exams found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters, or check back later.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Step 2: Registration Form */}
            {step === 2 && selectedExam && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in"> {/* Added simple fade-in */}
                    {/* Header with Exam Details */}
                    <div className="bg-indigo-600 p-6 text-white">
                        {/* Back Button */}
                        <button
                            onClick={resetSelection}
                            className="mb-4 -ml-2 inline-flex items-center text-indigo-100 hover:text-white hover:bg-indigo-700 px-2 py-1 rounded transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back to Exam List
                        </button>

                        {/* Selected Exam Info */}
                        <h2 className="text-2xl font-bold">{selectedExam.name}</h2>
                        <p className="mt-1 text-indigo-100 text-sm">{selectedExam.exam_description}</p>

                        {/* Exam Key Details */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                                <div>
                                    <div className="text-indigo-200">Date</div>
                                    <div className="font-medium">{selectedExam.formattedDate}</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
                                <div>
                                    <div className="text-indigo-200">Time</div>
                                    <div className="font-medium">{selectedExam.formattedTime} ({selectedExam.exam_duration} mins)</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                                <div>
                                    <div className="text-indigo-200">Mode</div>
                                    <div className="font-medium">{selectedExam.exam_mode === 'offline' ? 'Offline Center' : 'Online'}</div>
                                </div>
                            </div>
                             <div className="flex items-center">
                                <DollarSign className="h-5 w-5 mr-2 flex-shrink-0" />
                                <div>
                                    <div className="text-indigo-200">Fee</div>
                                    <div className="font-medium">₹{parseFloat(selectedExam.exam_fee).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                        {/* Registration Deadline */}
                         <div className="mt-4 text-sm text-indigo-100">
                             Registration closes: <span className="font-medium">{selectedExam.formattedRegistrationEndDate}</span>
                         </div>
                         {/* Prerequisites */}
                         {selectedExam.exam_prerequisites && (
                            <div className="mt-2 text-sm text-indigo-100">
                                Prerequisites: {selectedExam.exam_prerequisites}
                            </div>
                         )}
                    </div>

                    {/* Registration Form Body */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-6">Your Details</h3>

                        {/* General User Information Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Email Address */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                    // Disable if pre-filled from local storage? Consider if user should be able to change it.
                                    // disabled={!!JSON.parse(localStorage.getItem('user') || '{}').email}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel" // Use type="tel" for phone numbers
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>

                             {/* Date of Birth (Collected but not sent in current backend payload) */}
                             <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    id="dob"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.dob ? 'border-red-500' : 'border-gray-300'}`}
                                    // required // Make required if backend needs it
                                />
                                {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
                            </div>
                        </div>

                        {/* Mode-Specific Fields */}
                        {selectedExam.exam_mode === 'offline' && selectedExam.locations && selectedExam.locations.length > 0 && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-md">
                                <h4 className="text-lg font-semibold text-gray-700 mb-3">Location Preferences</h4>
                                <p className="text-sm text-gray-600 mb-3">Select your preferred exam center(s). We will try to assign you a seat in one of your preferred locations based on availability.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedExam.locations.map(location => (
                                        <div key={location.location} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`location-${location.location}`}
                                                name="locationPreferences" // Use the same name for all checkboxes in the group
                                                value={location.location} // The value should be the location name as expected by backend
                                                checked={formData.locationPreferences.includes(location.location)}
                                                onChange={handleLocationPreferenceChange}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`location-${location.location}`} className="ml-2 text-sm font-medium text-gray-700">
                                                {location.location}
                                                {/* Optionally display seat availability per location if available */}
                                                {location.total_seats !== undefined && location.filled_seats !== undefined && (
                                                     <span className="text-gray-500 ml-2">({location.total_seats - location.filled_seats} / {location.total_seats} seats available)</span>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.locationPreferences && <p className="mt-2 text-sm text-red-600">{errors.locationPreferences}</p>}
                            </div>
                        )}

                        {selectedExam.exam_mode === 'online' && selectedExam.exam_time_selection !== 'fixed' && (
                             // Online flexible time selection
                            <div className="mb-6 p-4 bg-gray-50 rounded-md">
                                <h4 className="text-lg font-semibold text-gray-700 mb-3">Select Exam Time</h4>
                                <p className="text-sm text-gray-600 mb-3">Please select your preferred exam time. Available times are between 08:00 AM and 4:59 PM.</p>
                                <div>
                                    <label htmlFor="selectedExamTime" className="block text-sm font-medium text-gray-700 mb-1">Preferred Time (HH:MM)</label>
                                    <input
                                        type="time" // Use type="time" for time picker
                                        id="selectedExamTime"
                                        name="selectedExamTime"
                                        value={formData.selectedExamTime}
                                        onChange={handleChange}
                                         // Set min/max attributes for browser validation hint, but rely on JS validation for strictness
                                        min="08:00"
                                        max="16:59" // Backend allows up to 17:00 (exclusive), so max is 16:59
                                        className={`w-full md:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.selectedExamTime ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.selectedExamTime && <p className="mt-1 text-sm text-red-600">{errors.selectedExamTime}</p>}
                                </div>
                            </div>
                        )}
                         {selectedExam.exam_mode === 'online' && selectedExam.exam_time_selection === 'fixed' && (
                             // Online fixed time - display only, no input
                             <div className="mb-6 p-4 bg-blue-50 rounded-md">
                                 <h4 className="text-lg font-semibold text-blue-800 mb-2">Exam Time: Fixed</h4>
                                 <p className="text-sm text-blue-700">This exam has a fixed time:</p>
                                 <p className="text-lg font-bold text-blue-900 mt-1">{selectedExam.formattedTime}</p>
                             </div>
                         )}


                        {/* Submission Error Message (General) */}
                        {submissionError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                <p>{submissionError}</p>
                            </div>
                        )}
                         {/* General Form Error (e.g., "Already registered") */}
                         {errors.form && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                <p>{errors.form}</p>
                            </div>
                         )}


                        {/* Submit Button */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                                    isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                                disabled={isSubmitting} // Disable button while submitting
                            >
                                {isSubmitting && <Loader2 className="animate-spin h-5 w-5 mr-3" />}
                                {isSubmitting ? 'Registering...' : 'Confirm Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toaster Notification */}
            {toasterMessage && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white z-50 ${
                    toasterType === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                    <div className="flex items-center">
                        {toasterType === 'success' ? (
                            <CheckCircle className="h-5 w-5 mr-2" />
                        ) : (
                            <AlertCircle className="h-5 w-5 mr-2" />
                        )}
                        <span>{toasterMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamRegistration1;
