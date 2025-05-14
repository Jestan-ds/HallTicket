import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Calendar, Clock, MapPin } from 'lucide-react'; // Import other icons you might want to use for display

// Assume your API base URL is defined elsewhere
const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your actual backend URL

// Define the structure matching the JSON returned by the backend endpoint
// (Assuming backend returns raw applied_at timestamp, not a pre-formatted string)
interface ExamDetails {
    id: string; // Or number
    applicationId: string;
    examId: string; // Or number
    examMode: string;
    assignedLocation: string | null; // Backend might return null
    seatNumber: string | null;
    selectedExamTime: string | null; // HH:MM:SS string or null
    status: string;
    appliedAt: string; // Raw timestamp string (e.g., ISO 8601)
    hallTicketUrl: string | null;
    examName: string;
    examTime: string | null; // HH:MM:SS string or null (from exams table)
    examDate: string | null; // MM/DD/YYYY string from backend
    examDuration: string | null; // Backend might return null
    examFee: number | null; // Backend might return null
    // Ensure all fields selected in your backend query are included here
}


const ExamDetailsPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>(); // Get the application ID from the URL
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      setExamDetails(null); // Clear previous details

      if (!applicationId) {
        setError("Application ID is missing in URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/examRegistration/registered-exams/${applicationId}`);

        // Check for HTTP errors (4xx, 5xx)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error format' })); // Try to read JSON error, handle parsing failure
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data: ExamDetails = await response.json();
        setExamDetails(data);

      } catch (err: any) { // Use 'any' for catch error type for broader compatibility
        console.error(`Error fetching exam details for ${applicationId}:`, err);
        setError(`Failed to load exam details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

  }, [applicationId]); // Rerun effect if the application ID in the URL changes

    // Helper function to format the raw timestamp from the backend
    const formatAppliedDate = (timestamp: string | undefined): string => {
        if (!timestamp) return 'N/A';
        try {
             // Assuming timestamp is a valid date string (like ISO 8601)
            const date = new Date(timestamp);
            // Check if the date is valid before formatting
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return new Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'short' }).format(date);
        } catch (e) {
            console.error("Failed to format date:", e);
            return 'Formatting Error';
        }
    };


  // --- JSX Rendering ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
      return (
          <div className="max-w-4xl mx-auto mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
          </div>
      );
  }

  if (!examDetails) {
       // This case might be hit if fetch succeeded but returned null (unlikely with the backend code)
       // or if the ID was missing and setError was called, but we're already handling error state.
       // This might also occur briefly before loading is set to false.
       // Given the logic, this block is primarily a fallback/visual state while loading transitions.
       // It's less likely to be hit if an error occurred (error state handles that) or if data was found.
       return <div className="max-w-4xl mx-auto mt-8 text-center text-gray-600">Loading details...</div>; // Or just return null, loading spinner covers initial state
  }


  // Render the detailed information using examDetails state
  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 sm:p-6 lg:p-8 bg-white shadow-md rounded-lg"> {/* Added padding */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{examDetails.examName} Details</h1> {/* Adjusted margin */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6"> {/* Used grid for layout */}
         <div>
            <p className="text-gray-700 mb-2"><strong>Application ID:</strong> {examDetails.applicationId}</p>
            <p className="text-gray-700 mb-2"><strong>Status:</strong> {examDetails.status}</p>
            <p className="text-gray-700 mb-2"><strong>Exam Mode:</strong> {examDetails.examMode || 'N/A'}</p> {/* Display exam mode */}
            <p className="text-gray-700 mb-2"><strong>Applied On:</strong> {formatAppliedDate(examDetails.appliedAt)}</p> {/* Use the formatting helper */}
         </div>

         <div>
            <div className="flex items-center text-gray-700 mb-2">
                 <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                 <strong>Exam Date:</strong>
            </div>
            <p className="text-gray-600 ml-7">{examDetails.examDate || 'N/A'}</p> {/* Indent */}

             <div className="flex items-center text-gray-700 mb-2 mt-4"> {/* Added margin top */}
                 <Clock className="h-5 w-5 text-indigo-500 mr-2" />
                 <strong>Exam Time:</strong>
            </div>
            <p className="text-gray-600 ml-7">{examDetails.examTime || examDetails.selectedExamTime || 'N/A'}</p> {/* Indent */}

             <div className="flex items-center text-gray-700 mb-2 mt-4"> {/* Added margin top */}
                 <Clock className="h-5 w-5 text-indigo-500 mr-2" />
                 <strong>Duration:</strong>
            </div>
             <p className="text-gray-600 ml-7">{examDetails.examDuration || 'N/A'}</p> {/* Indent */}

             <div className="flex items-center text-gray-700 mb-2 mt-4"> {/* Added margin top */}
                 <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                 <strong>Location:</strong>
            </div>
            <p className="text-gray-600 ml-7">{examDetails.assignedLocation || 'N/A'}</p> {/* Indent */}

            {examDetails.status === 'approved' && examDetails.seatNumber && (
                <p className="text-gray-700 mb-2 mt-4 ml-7"><strong>Seat Number:</strong> {examDetails.seatNumber}</p> // Added margin top and indent
            )}

             {examDetails.examFee !== null && examDetails.examFee !== undefined && ( // Check if fee exists
                <p className="text-gray-700 mb-2 mt-4"><strong>Exam Fee:</strong> ${examDetails.examFee}</p> // Display fee
             )}

         </div>
      </div>


      {/* Download hall ticket button if hallTicketUrl exists and status is approved */}
       {examDetails.status === 'approved' && examDetails.hallTicketUrl ? (
            <a
             href={examDetails.hallTicketUrl}
             target="_blank" // Open in new tab
             rel="noopener noreferrer" // Security best practice
             className="inline-flex items-center mt-6 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
            >
             <Download className="h-5 w-5 mr-2" />
              Download Hall Ticket
           </a>
       ) : examDetails.status === 'pending' ? (
           <div className="text-amber-600 font-medium flex items-center mt-6 text-sm">
             <Clock className="h-5 w-5 mr-1" />
             Awaiting Approval for Hall Ticket
            </div>
       ) : null /* Don't show anything for rejected status */ }

      {/* Add more sections as needed */}
    </div>
  );
};

export default ExamDetailsPage;