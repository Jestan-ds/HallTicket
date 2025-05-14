import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../UI/Card';
import Button from '../UI/Button1';
import Input from '../UI/Input1';
import Select from '../UI/Select';
import Textarea from '../UI/Textarea';
import { AlertCircle, CheckCircle } from 'lucide-react'; // Import icons for toaster
// Assuming these types are correct based on your schema and API needs
import { Exam, ExamLocation } from '../types/index'; // Make sure these types match your backend schema closely

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your base URL is different

// Define the expected structure for locations when sending to the backend create endpoint
interface ExamLocationForCreation {
    name: string;
    total_seats: number;
    // filled_seats is handled by backend on creation, no need to send
}


const CreateExamForm: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null); // State to show submission errors

    // --- Toaster State ---
    const [toasterMessage, setToasterMessage] = useState<string | null>(null);
    const [toasterType, setToasterType] = useState<'success' | 'error' | null>(null);
    // --------------------

    // State for form data, matching backend requirements and frontend inputs
    const [formData, setFormData] = useState({
        name: '',
        exam_mode: '', // 'online' | 'offline'
        exam_time_selection: '', // 'fixed' | 'flexible'
        exam_date: '', // Expected YYYY-MM-DD format from date input
        exam_time: '', // Expected HH:MM format from time input (for fixed online)
        exam_duration: '120', // Default value
        exam_fee: '0', // Default value
        exam_registrationEndDate: '', // Expected YYYY-MM-DD format
        exam_category: '',
        exam_description: '',
        exam_prerequisites: '',
        // locations are handled separately in 'locations' state
    });

    // State for location details, relevant only if exam_mode is 'offline'
    // Using a specific type for the state shape to satisfy TypeScript validation
    interface ExamLocationState {
        name: string;
        total_seats: number;
    }
    const [locations, setLocations] = useState<ExamLocationState[]>([
        { name: '', total_seats: 0 }
    ]);

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


    // Handle basic input changes for formData
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

    // Handle input changes for location array state
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
        setLocations([...locations, { name: '', total_seats: 0 }]);
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
        if (!formData.name.trim()) newErrors.name = 'Exam Name is required';
        if (!formData.exam_category) newErrors.exam_category = 'Exam Category is required';
        if (!formData.exam_mode) newErrors.exam_mode = 'Exam Mode is required';
        if (!formData.exam_time_selection) newErrors.exam_time_selection = 'Time Selection is required';
        if (!formData.exam_date) newErrors.exam_date = 'Exam Date is required';

        // Duration validation
        const duration = Number(formData.exam_duration);
        if (!formData.exam_duration || isNaN(duration) || duration <= 0) newErrors.exam_duration = 'Duration must be a positive number';

        // Fee validation
        const fee = Number(formData.exam_fee);
        if (!formData.exam_fee || isNaN(fee) || fee < 0) newErrors.exam_fee = 'Fee cannot be negative or invalid';

        if (!formData.exam_registrationEndDate) newErrors.exam_registrationEndDate = 'Registration End Date is required';
        if (!formData.exam_description.trim()) newErrors.exam_description = 'Exam Description is required';
        if (!formData.exam_prerequisites.trim()) newErrors.exam_prerequisites = 'Prerequisites are required';


        // Conditional validation based on exam mode and time selection
        if (formData.exam_mode === 'offline') {
            // Validate locations for offline mode
            if (locations.length === 0) {
                newErrors.locations = 'At least one location is required for offline exams';
            } else {
                locations.forEach((loc, index) => {
                    if (!loc.name.trim()) newErrors[`location_${index}_name`] = `Location name ${index + 1} is required`;
                    const totalSeats = Number(loc.total_seats);
                    if (loc.total_seats === undefined || isNaN(totalSeats) || totalSeats <= 0) {
                        newErrors[`location_${index}_total_seats`] = `Total seats for location ${index + 1} must be a positive number`;
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


    // Handle form submission
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

        // Prepare the payload data for the backend, matching backend's createExams expectations
        const payload: any = { // Using 'any' for simplicity, ideally use a specific interface for create payload
            // Generate a unique ID for the exam. Backend might prefer generating this itself.
            // If backend generates, remove 'id' from payload and required fields.
            id: `exam_${formData.exam_mode || 'unknown'}_${formData.exam_time_selection || 'unknown'}_${Date.now()}`,
            name: formData.name,
            exam_mode: formData.exam_mode,
            exam_time_selection: formData.exam_time_selection,
            exam_date: formData.exam_date,
            // Only include exam_time if it's a fixed online exam and the input is not empty
            // Send as HH:MM or HH:MM:SS string as typed by user.
            exam_time: formData.exam_time_selection === 'fixed' && formData.exam_time ? formData.exam_time : undefined,
            exam_duration: Number(formData.exam_duration), // Convert to number
            exam_fee: Number(formData.exam_fee), // Convert to number
            exam_registrationEndDate: formData.exam_registrationEndDate,
            exam_category: formData.exam_category,
            exam_description: formData.exam_description,
            exam_prerequisites: formData.exam_prerequisites,
            // Locations are added conditionally below
        };

        // Add locations to payload only for offline exams
        if (formData.exam_mode === 'offline') {
            // Map frontend location state to backend expected structure
            payload.locations = locations.map(loc => ({
                name: loc.name,
                total_seats: Number(loc.total_seats), // Ensure number
                // backend handles filled_seats, so don't include it here
            }));
        }

        // --- Get Auth Token ---
        const token = localStorage.getItem('authToken'); // Adjust how you get your auth token
        if (!token) {
            const authError = 'Authentication token not found. Please log in.';
            setSubmissionError(authError);
            setToasterMessage(authError);
            setToasterType('error');
            setIsSubmitting(false);
            // Optionally redirect to login if token is missing
            // navigate('/login');
            return;
        }


        // --- Real API Call to Backend ---
        try {
            const response = await fetch(`${API_BASE_URL}/exam/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Include auth token
                },
                credentials: 'include', // Include if your backend uses cookies/sessions for auth/rate limiting
                body: JSON.stringify(payload),
            });

            // Check for non-OK response status (e.g., 400, 401, 403, 500)
            if (!response.ok) {
                // Attempt to parse error body, but handle potential parsing errors
                const errorBody = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                console.error('Exam creation failed:', response.status, errorBody);
                const errorMessage = errorBody.error || `Failed to create exam. Status: ${response.status}`;
                setSubmissionError(errorMessage); // Set submission error state
                // --- Trigger Error Toaster ---
                setToasterMessage(errorMessage);
                setToasterType('error');
                // -----------------------------
                // Do NOT navigate on error
                return; // Stop processing
            }

            // If response is OK (status 2xx), assume success based on your backend returning 201 and { success: true, ... }
            const result = await response.json();
            console.log('Exam created successfully:', result.message);

            // --- Trigger Success Toaster ---
            setToasterMessage(result.message || 'Exam created successfully!');
            setToasterType('success');
            // ---------------------------------

            // Redirect to exams list page after a short delay to allow the toaster message to be seen
            setTimeout(() => {
                navigate('/admin/exams');
            }, 2000); // Navigate after 2 seconds

        } catch (error: any) {
            // Handle network errors or issues before a response is received (e.g., server is down, cors issues)
            console.error('Error during exam creation fetch:', error);
            const errorMessage = `An unexpected error occurred: ${error.message}. Please check your network connection and server status.`;
            setSubmissionError(errorMessage); // Set submission error state
            // --- Trigger Error Toaster ---
            setToasterMessage(errorMessage);
            setToasterType('error');
            // -----------------------------
            // Do NOT navigate on error
        } finally {
            setIsSubmitting(false); // Always stop loading state
        }
    };


    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6">
            {/* --- Toaster Display --- */}
            {toasterMessage && (
                <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 flex items-center space-x-2
                              ${toasterType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toasterType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{toasterMessage}</span>
                    <button onClick={() => setToasterMessage(null)} className="ml-2 font-bold cursor-pointer">&times;</button> {/* Added cursor-pointer */}
                </div>
            )}
            {/* ----------------------- */}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Create New Exam</h1>
                {/* Optional: Add a back button */}
                 <Button variant="outline" onClick={() => navigate('/admin/exams')}>
                    Cancel
                 </Button>
            </div>

            {/* submissionError is primarily shown in toaster, but can keep this for more persistent display if needed */}
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
                                    value={formData.name}
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
                                    value={formData.exam_category}
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
                                    value={formData.exam_mode}
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
                                    value={formData.exam_time_selection}
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
                                    value={formData.exam_date}
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
                                        value={formData.exam_time}
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
                                    value={formData.exam_duration}
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
                                    value={formData.exam_fee}
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
                                    value={formData.exam_registrationEndDate}
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
                                value={formData.exam_description}
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
                                value={formData.exam_prerequisites}
                                onChange={handleInputChange}
                                rows={3}
                                required
                            />
                            {errors.exam_prerequisites && <p className="text-red-500 text-sm mt-1">{errors.exam_prerequisites}</p>} {/* Corrected error key */}
                        </div>

                        {/* Locations section for offline exams */}
                        {formData.exam_mode === 'offline' && (
                            <div className="mt-6">
                                <h3 className="text-md font-medium mb-3">Exam Locations</h3>
                                {errors.locations && <p className="text-red-500 text-sm mb-3">{errors.locations}</p>}

                                {locations.map((location, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-md">
                                        {/* Location Name */}
                                        <div>
                                            <Input
                                                label="Location Name"
                                                value={location.name}
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
                                                value={location.total_seats}
                                                onChange={(e) => handleLocationChange(index, 'total_seats', parseInt(e.target.value, 10))} // Use parseInt with radix 10
                                                required
                                                min={1}
                                            />
                                            {errors[`location_${index}_total_seats`] && <p className="text-red-500 text-sm mt-1">{errors[`location_${index}_total_seats`]}</p>}
                                        </div>

                                        {/* Add/Remove Location Buttons */}
                                        <div className="flex items-end mb-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeLocation(index)}
                                                disabled={locations.length <= 1} // Disable remove if only one location left for offline
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
                                        Add Location <Plus size={16} className="ml-1" />
                                    </Button>
                                )}
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            Create Exam
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default CreateExamForm;