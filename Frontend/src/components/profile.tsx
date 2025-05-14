import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Save, CheckCircle } from 'lucide-react';

// Assume your API base URL is defined elsewhere
// !! IMPORTANT: Replace with your actual backend URL where your API is hosted.
// If running locally, this might be 'http://localhost:3000/api' or similar.
const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your actual backend URL

// Define the structure of the user data expected from the backend
// Ensure this matches the exact keys and types returned by your backend GET endpoint.
interface UserProfile {
    id: string; // Or number, depending on your DB schema
    name: string;
    email: string;
    phone: string;
    dob: string; // Assuming backend returns date as a string (e.g., 'YYYY-MM-DD')
    gender: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    profileCompleted: boolean;
    // Add any other fields your backend returns for the user profile
}

// Initial state for user data before it's fetched.
// Use default values that match the UserProfile structure.
const INITIAL_USER_DATA: UserProfile = {
    id: '',
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profileCompleted: false,
    // Initialize other fields from UserProfile interface with appropriate defaults (e.g., null, '', 0, false)
};


const Profile = () => {
  // State to hold the user data, initialized with empty defaults
  const [userData, setUserData] = useState<UserProfile>(INITIAL_USER_DATA);
  // State to track if the initial data fetch is in progress
  const [loading, setLoading] = useState(true);
  // State to track if the profile update (save) is in progress
  const [saving, setSaving] = useState(false);
  // State to show a success message after saving
  const [saved, setSaved] = useState(false);
  // State to hold form validation errors (client-side)
  const [errors, setErrors] = useState<Record<string, string>>({});
  // State to hold errors from the initial data fetch
  const [fetchError, setFetchError] = useState<string | null>(null);
  // State to hold errors from the profile save operation
  const [saveError, setSaveError] = useState<string | null>(null);

  // !! IMPORTANT: This needs to be the actual authenticated user's ID.
  // Replace '123' with logic to get the ID from your authentication context, state, or token.
  const user = JSON.parse(localStorage.getItem('user') || '{}'); // Example: Get user from local storage
  const authId = user.id; // Replace with your actual logic to get the authenticated user's ID
  // useEffect hook to fetch user profile data when the component mounts
  // or when the authId changes.
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Extract only the date part (YYYY-MM-DD)
  };
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true); // Start loading state
      setFetchError(null); // Clear any previous fetch errors

      // Prevent fetching if authId is not available
      if (!authId) {
          setFetchError("Authentication ID is missing. Cannot fetch profile.");
          setLoading(false);
          // Log a warning in development mode
          
          return; // Stop the function if no authId
      }

      try {
        // Construct the API endpoint URL for fetching the user profile.
        // Assuming your backend GET route is /api/users/:id
        const url = `${API_BASE_URL}/userDetails/${authId}`; // Adjust endpoint path if needed

        const response = await fetch(url);

        // Check if the HTTP response status is OK (200-299)
        if (!response.ok) {
          // Attempt to read a JSON error message from the backend response body
          // Use .catch() to handle cases where the response body is not valid JSON
          const errorData = await response.json().catch(() => ({ error: 'Unknown error format or empty response' }));
           // You might want specific handling for 404 Not Found if creating a profile is possible
           if (response.status === 404 && errorData.error && errorData.error.toLowerCase().includes('not found')) {
               setFetchError("User profile not found. Please complete your profile."); // User might need to create it
               // Optionally set userData to INITIAL_USER_DATA here if you handle profile creation
           } else {
              // Throw a new Error with a descriptive message
              throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
           }
           return; // Stop execution if an error occurred
        }

        // Parse the JSON response body into the UserProfile type
        const data: UserProfile = await response.json();
        // Update the component state with the fetched user data
        setUserData({
          ...data,
          dob: formatDate(data.dob), // Format date to YYYY-MM-DD for input compatibility
        });

      } catch (err: any) { // Catch any errors during the fetch or processing
        console.error(`Error fetching user profile for ${authId}:`, err);
        // Set the fetchError state to display an error message to the user
        setFetchError(`Failed to load profile: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        // Always set loading to false when the fetch operation finishes
        setLoading(false);
      }
    };

    fetchUserProfile(); // Call the fetch function when the component mounts or authId changes

  }, [authId]); // Dependency array: Re-run this effect if the authId value changes

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Update the specific field in the userData state
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear the specific validation error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Reset the 'saved successfully' notification if the form is modified
    if (saved) {
      setSaved(false);
    }
    // Clear any previous save errors if the form is modified
    if (saveError) {
        setSaveError(null);
    }
  };

  // Validate form fields before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Perform validation checks based on the current userData state
    if (!userData.name || !userData.name.trim()) newErrors.name = 'Full name is required';
    if (!userData.email || !userData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userData.email)) newErrors.email = 'Email is invalid';
    if (!userData.phone || !userData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!userData.address || !userData.address.trim()) newErrors.address = 'Address is required';
    if (!userData.city || !userData.city.trim()) newErrors.city = 'City is required';
    if (!userData.state || !userData.state.trim()) newErrors.state = 'State is required';
    if (!userData.zipCode || !userData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    // Update the errors state
    setErrors(newErrors);
    // Return true if there are no errors, false otherwise
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission to update user profile on the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission

    // Clear any previous save errors before attempting to save
    setSaveError(null);

    // Validate the form before proceeding
    if (validateForm()) {
      setSaving(true); // Start saving state
      setSaved(false); // Reset saved state at the start of saving

      // Prevent saving if authId is not available
      if (!authId) {
          setSaveError("Authentication ID is missing. Cannot save profile.");
          setSaving(false);
          return; // Stop the function if no authId
      }

      try {
           // Construct the API endpoint URL for updating the user profile.
           // Based on your backend route: PUT /api/users/update/:id
           const url = `${API_BASE_URL}/userDetails/update/${authId}`; // Adjust endpoint path if needed

           // Make the PUT request to the backend API
           const response = await fetch(url, {
               method: 'PUT', // Use PUT method as defined in your backend route
               headers: {
                   'Content-Type': 'application/json', // Indicate that the body is JSON
                   // !! IMPORTANT: Include your authentication token here if required by your backend
                   // Example: 'Authorization': `Bearer ${yourAuthToken}`
               },
               // Send the current userData state as the JSON body.
               // Ensure the keys here match what your backend updateUserDetails function expects.
               body: JSON.stringify({
                   name: userData.name,
                   phone: userData.phone,
                   dob: userData.dob,
                   gender: userData.gender,
                   address: userData.address,
                   city: userData.city,
                   state: userData.state,
                   zipCode: userData.zipCode,
                   email: userData.email, // Include email in the body as per your backend
                   // Include any other fields your backend update expects and your form collects
               }),
           });

           // Check if the HTTP response status is OK (200-299)
           if (!response.ok) {
                // Attempt to read a JSON error message from the backend response body
                const errorData = await response.json().catch(() => ({ error: 'Unknown error format or empty response' }));
                // Throw a new Error with a descriptive message
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
           }

           // If the backend returns a success message or the updated user profile,
           // you could optionally read it here:
           // const result = await response.json();
           // console.log("Update successful:", result);

           setSaved(true); // Indicate successful save

            // Automatically hide the 'saved successfully' message after 3 seconds
            setTimeout(() => {
              setSaved(false);
            }, 3000);

      } catch (err: any) { // Catch any errors during the fetch or processing
          console.error("Error saving user profile:", err);
          // Set the saveError state to display an error message to the user
          setSaveError(`Failed to save profile: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
         // Always set saving to false when the save operation finishes
         setSaving(false);
      }
    }
  };

  // --- JSX Rendering ---

  // Render loading spinner while data is being fetched initially
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen"> {/* Use h-screen for full height */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

   // Display a fetch error message if the initial fetch failed
  if (fetchError) {
      return (
          <div className="max-w-4xl mx-auto mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{fetchError}</span>
          </div>
      );
  }

  // Render the form once data is loaded (loading is false and no fetchError)
  // If fetchError occurred, this block is skipped.
  // If loading is false and no fetchError, userData should contain the fetched data
  // or the initial empty state if the user profile didn't exist (handled by 404 check).
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added padding */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header Section */}
        {/* Render header if userData has been loaded (check by id or email) */}
        {(userData.id || userData.email) ? (
             <div className="bg-indigo-600 p-6 text-white">
               <div className="flex items-center">
                 {/* Display initials or a default icon */}
                 <div className="h-20 w-20 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-600 text-2xl font-bold overflow-hidden">
                   {userData.name ? userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : <User size={40} />} {/* Show initials or User icon */}
                 </div>
                 <div className="ml-6">
                   <h2 className="text-2xl font-bold">{userData.name || 'N/A'}</h2> {/* Display name or N/A */}
                   <p className="text-indigo-200">{userData.email || 'N/A'}</p> {/* Display email or N/A */}
                 </div>
               </div>
             </div>
        ) : (
            // Optional: Placeholder header while loading or if no initial data
             <div className="bg-indigo-600 p-6 text-white">
                 <div className="flex items-center">
                     <div className="h-20 w-20 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                        <User size={40} />
                     </div>
                     <div className="ml-6">
                         <h2 className="text-2xl font-bold">Profile Information</h2> {/* Generic title */}
                         <p className="text-indigo-200">Please complete your details</p>
                     </div>
                 </div>
             </div>
        )}


        {/* Profile Form Section */}
        <div className="p-4 sm:p-6 lg:p-8"> {/* Adjusted padding */}
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-8">
              <div className="flex items-center mb-4 text-gray-700">
                <User className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={saving || loading} // Disable while saving or loading
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    // Disable if saving/loading OR if email is already a non-empty string and different from initial empty state
                    // Using !! ensures the expression is always a boolean
                    disabled={saving || loading || (!!userData.email && userData.email !== INITIAL_USER_DATA.email)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={saving || loading}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                   {/* Consider using a proper date picker component in a real app */}
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={userData.dob}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving || loading}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={userData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed" // Added appearance-none and bg-white
                    disabled={saving || loading}
                  >
                     <option value="" disabled>Select Gender</option> {/* Added disabled placeholder */}
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                     {/* Custom arrow */}
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                         <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l-.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                     </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <div className="flex items-center mb-4 text-gray-700">
                <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="text-lg font-semibold">Address Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 relative">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={userData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={saving || loading}
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={userData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                     disabled={saving || loading}
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={userData.state}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                     disabled={saving || loading}
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code*</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={userData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                     disabled={saving || loading}
                  />
                  {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>}
                </div>
              </div>
            </div>

            {/* Save Button and Status */}
            <div className="flex justify-end items-center">
              {/* Display save success message */}
              {saved && (
                <div className="mr-4 flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span>Profile saved successfully!</span>
                </div>
              )}

              {/* Display save error message */}
              {saveError && <div className="mr-4 text-red-500 text-sm">{saveError}</div>}

              {/* Save button */}
              <button
                type="submit"
                // Disable button while loading (initial fetch) or saving (update)
                disabled={saving || loading}
                className={`px-6 py-2 rounded-md text-white font-medium flex items-center transition-colors ${saving || loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {saving ? (
                  <>
                    {/* Spinner icon */}
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    {/* Save icon */}
                    <Save className="h-5 w-5 mr-2" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
