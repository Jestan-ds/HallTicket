// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Download, Calendar, Clock, MapPin, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';

// // Mock registered exams
// const REGISTERED_EXAMS = [
//   { 
//     id: 'app123',
//     applicationId: 'APP123XYZ',
//     examId: 'math101',
//     examName: 'Mathematics 101',
//     date: '2025-06-15',
//     time: '09:00 AM',
//     duration: '3 hours',
//     location: 'Main Campus, Building A',
//     room: 'Room 101',
//     seatNumber: 'A45',
//     status: 'approved',
//     appliedAt: '2025-05-01T10:30:00Z',
//     hallTicketUrl: '#'
//   },
//   { 
//     id: 'app456',
//     applicationId: 'APP456ABC',
//     examId: 'phys201',
//     examName: 'Physics 201',
//     date: '2025-06-18',
//     time: '10: 00 AM',
//     duration: '3 hours',
//     location: 'Science Building, Room 302',
//     room: 'Room 302',
//     seatNumber: 'B12',
//     status: 'pending',
//     appliedAt: '2025-05-05T14:20:00Z',
//     hallTicketUrl: null
//   },
//   { 
//     id: 'app789',
//     applicationId: 'APP789DEF',
//     examId: 'chem301',
//     examName: 'Chemistry 301',
//     date: '2025-06-20',
//     time: '02:00 PM',
//     duration: '3 hours',
//     location: 'Science Building, Lab 201',
//     room: 'Lab 201',
//     seatNumber: 'C08',
//     status: 'approved',
//     appliedAt: '2025-05-10T09:15:00Z',
//     hallTicketUrl: '#'
//   }
// ];

// const RegisteredExams = () => {
//   const [registeredExams, setRegisteredExams] = useState(REGISTERED_EXAMS);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
  
//   useEffect(() => {
//     // Simulate API call to fetch registered exams
//     setTimeout(() => {
//       setRegisteredExams(REGISTERED_EXAMS);
//       setLoading(false);
//     }, 800);
//   }, []);
  
//   // Filter exams based on search and status filter
//   const filteredExams = registeredExams.filter(exam => {
//     const matchesSearch = exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                          exam.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter ? exam.status === statusFilter : true;
    
//     return matchesSearch && matchesStatus;
//   });
  
//   const handleDownloadHallTicket = (exam: typeof REGISTERED_EXAMS[0]) => {
//     // In a real app, this would download the hall ticket or redirect to a download endpoint
//     alert(`Hall ticket for ${exam.examName} is being downloaded.`);
//   };
  
//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return (
//           <div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full">
//             <CheckCircle className="h-4 w-4 mr-1" />
//             <span>Approved</span>
//           </div>
//         );
//       case 'rejected':
//         return (
//           <div className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-full">
//             <AlertTriangle className="h-4 w-4 mr-1" />
//             <span>Rejected</span>
//           </div>
//         );
//       default:
//         return (
//           <div className="flex items-center text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
//             <Clock className="h-4 w-4 mr-1" />
//             <span>Pending</span>
//           </div>
//         );
//     }
//   };
  
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="max-w-6xl mx-auto">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">My Registered Exams</h1>
      
//       {/* Search and Filters */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//           <div className="flex-1 relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               placeholder="Search by exam name or application ID..."
//               className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
          
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Filter className="h-4 w-4 text-gray-400" />
//             </div>
//             <select
//               className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//             >
//               <option value="">All Statuses</option>
//               <option value="approved">Approved</option>
//               <option value="pending">Pending</option>
//               <option value="rejected">Rejected</option>
//             </select>
//           </div>
//         </div>
//       </div>
      
//       {/* Exam List */}
//       {filteredExams.length > 0 ? (
//         <div className="space-y-6">
//           {filteredExams.map(exam => (
//             <div key={exam.id} className="bg-white rounded-lg shadow-md overflow-hidden">
//               <div className="p-6 border-b">
//                 <div className="flex flex-col md:flex-row md:justify-between md:items-center">
//                   <div>
//                     <h2 className="text-xl font-semibold text-gray-800">{exam.examName}</h2>
//                     <p className="text-gray-500 mt-1">Application ID: {exam.applicationId}</p>
//                   </div>
//                   {getStatusBadge(exam.status)}
//                 </div>
//               </div>
              
//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//                   <div>
//                     <div className="flex items-center mb-3">
//                       <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
//                       <h3 className="font-medium text-gray-700">Date & Time</h3>
//                     </div>
//                     <p className="text-gray-600">{exam.date}</p>
//                     <p className="text-gray-600">{exam.time} ({exam.duration})</p>
//                   </div>
                  
//                   <div>
//                     <div className="flex items-center mb-3">
//                       <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
//                       <h3 className="font-medium text-gray-700">Location</h3>
//                     </div>
//                     <p className="text-gray-600">{exam.location}</p>
//                     {exam.status === 'approved' && (
//                       <>
//                         <p className="text-gray-600">{exam.room}</p>
//                         <p className="text-gray-600">Seat: {exam.seatNumber}</p>
//                       </>
//                     )}
//                   </div>
                  
//                   <div>
//                     <div className="flex items-center mb-3">
//                       <Clock className="h-5 w-5 text-indigo-500 mr-2" />
//                       <h3 className="font-medium text-gray-700">Application Date</h3>
//                     </div>
//                     <p className="text-gray-600">{new Date(exam.appliedAt).toLocaleDateString()}</p>
//                   </div>
//                 </div>
                
//                 <div className="flex justify-between items-center pt-4 border-t">
//                   <Link 
//                     to={`/status/${exam.applicationId}`}
//                     className="text-indigo-600 hover:text-indigo-800 font-medium"
//                   >
//                     View Details
//                   </Link>
                  
//                   {exam.status === 'approved' ? (
//                     <button
//                       onClick={() => handleDownloadHallTicket(exam)}
//                       className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
//                     >
//                       <Download className="h-5 w-5 mr-2" />
//                       Download Hall Ticket
//                     </button>
//                   ) : (
//                     <div className="text-amber-600 font-medium flex items-center">
//                       <Clock className="h-5 w-5 mr-1" />
//                       Awaiting Approval
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-md p-8 text-center">
//           <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-gray-800 mb-2">No Registered Exams Found</h2>
//           <p className="text-gray-600 mb-6">You haven't registered for any exams yet or no exams match your search criteria.</p>
//           <Link 
//             to="/register-exam"
//             className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
//           >
//             <Calendar className="h-5 w-5 mr-2" />
//             Register for an Exam
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RegisteredExams;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Calendar, Clock, MapPin, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';

// Assume your API base URL is defined elsewhere, e.g., in an environment variable
const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your actual backend URL

// Define the structure of the data you expect from the backend
interface RegisteredExamBackend {
  id: string; // Or number, depending on your DB
  application_id: string;
  exam_id: string; // Or number
  exam_mode: string;
  assigned_location: string;
  seat_number: string | null;
  selected_exam_time: string | null; // HH:MM:SS string or null
  status: string;
  applied_at: string; // Raw timestamp string
  hall_ticket_url: string | null;
  exam_time: string | null; // HH:MM:SS string or null (from exams table)
  exam_date: string | null; // Formatted MM/DD/YYYY string from backend
  exam_name: string;
  exam_duration: string;
  exam_fee: number; // Or string
}

// Define the structure for your frontend state (mapped data)
interface RegisteredExamFrontend {
  id: string; // Or number
  applicationId: string;
  examId: string; // Or number
  examName: string;
  date: string; // MM/DD/YYYY
  time: string; // HH:MM:SS (or potentially formatted later)
  duration: string;
  location: string; // Mapped from assigned_location
  room?: string; // Not directly from backend, maybe assigned_location implies this?
  seatNumber: string | null; // Mapped from seat_number
  status: string;
  appliedAt: string; // Raw timestamp
  hallTicketUrl: string | null;
}

const RegisteredExams = () => {
  // State to hold the fetched and mapped exam data
  const [registeredExams, setRegisteredExams] = useState<RegisteredExamFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // In a real app, get the authenticated user's ID from your auth context or state
  // For this example, we'll use a placeholder. Replace with actual logic.
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const authId = user.id; // Assuming you store authId in localStorage or context

  useEffect(() => {
    const fetchRegisteredExams = async () => {
      setLoading(true);
      setError(null); // Clear previous errors

      // Ensure authId is available before fetching
      if (!authId) {
          setError("Authentication ID is missing.");
          setLoading(false);
          return;
      }

      try {
        // Construct the API endpoint URL
        const url = `${API_BASE_URL}/examRegistration/getUserExamStats/${authId}`; // Assuming the route is /api/registered-exams/:id

        const response = await fetch(url);

        // Check for HTTP errors (4xx, 5xx)
        if (!response.ok) {
          const errorData = await response.json(); // Try to read error message from backend
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data: RegisteredExamBackend[] = await response.json();

        // Map backend data structure to frontend data structure
        const mappedData: RegisteredExamFrontend[] = data.map(exam => ({
          id: exam.id,
          applicationId: exam.application_id,
          examId: exam.exam_id,
          examName: exam.exam_name,
          date: exam.exam_date || 'N/A', // Use formatted date from backend
          // Decide which time to use: exam_time (general) or selected_exam_time (user choice)
          // For simplicity, let's use exam_time if available, otherwise selected_exam_time
          // You might need more complex logic based on exam_mode
          time: exam.exam_time || exam.selected_exam_time || 'N/A', // Use time from backend
          duration: exam.exam_duration || 'N/A',
          location: exam.assigned_location || 'N/A', // Use assigned_location for location
          // The mock had 'room', but backend doesn't. We'll omit it in the mapping,
          // and update the rendering below to not rely on `exam.room`.
          // If assigned_location sometimes includes room details, you might parse it here.
          seatNumber: exam.seat_number,
          status: exam.status,
          appliedAt: exam.applied_at, // Keep as raw timestamp for date formatting in render
          hallTicketUrl: exam.hall_ticket_url,
        }));

        setRegisteredExams(mappedData);

      } catch (err: any) {
        console.error("Error fetching registered exams:", err);
        setError(`Failed to fetch exams: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredExams();

  }, [authId]); // Depend on authId so data refetches if user changes (in a real app)

  // Filter exams based on search and status filter
  const filteredExams = registeredExams.filter(exam => {
    const matchesSearch = exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (exam.location && exam.location.toLowerCase().includes(searchTerm.toLowerCase())); // Also search location
    const matchesStatus = statusFilter ? exam.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const handleDownloadHallTicket = (exam: RegisteredExamFrontend) => {
    if (exam.hallTicketUrl) {
      // In a real app, redirect or trigger download
      window.open(exam.hallTicketUrl, '_blank'); // Open URL in new tab/window
      // Or trigger a fetch/download request to the URL
      // alert(`Downloading hall ticket for ${exam.examName} from ${exam.hallTicketUrl}`);
    } else {
      alert(`Hall ticket not available for ${exam.examName}.`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Rejected</span>
          </div>
        );
      default: // pending or any other status
        return (
          <div className="flex items-center text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>Pending</span>
          </div>
        );
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
          <div className="max-w-6xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Added padding */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Registered Exams</h1>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6"> {/* Adjusted padding */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by exam name, application ID, or location..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white" // Added appearance-none and bg-white
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            {/* Add a custom arrow icon for the select */}
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l-.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Exam List */}
      {filteredExams.length > 0 ? (
        <div className="space-y-6">
          {filteredExams.map(exam => (
            <div key={exam.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 sm:p-6 border-b"> {/* Adjusted padding */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0"> {/* Added spacing */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{exam.examName}</h2>
                    <p className="text-gray-500 text-sm mt-1">Application ID: {exam.applicationId}</p> {/* Smaller text */}
                  </div>
                  {getStatusBadge(exam.status)}
                </div>
              </div>

              <div className="p-4 sm:p-6"> {/* Adjusted padding */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="flex items-center mb-2 text-gray-700"> {/* Adjusted margin and text color */}
                      <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="font-medium ">Date & Time</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{exam.date}</p> {/* Smaller text */}
                    <p className="text-gray-600 text-sm">{exam.time} {exam.duration && `(${exam.duration})`}</p> {/* Smaller text, conditional duration */}
                  </div>

                  <div>
                    <div className="flex items-center mb-2 text-gray-700"> {/* Adjusted margin and text color */}
                      <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="font-medium">Location</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{exam.location}</p> {/* Smaller text */}
                    {exam.status === 'approved' && exam.seatNumber && ( // Only show seat if approved and seat number exists
                      <>
                        {/* Removed exam.room as it's not in backend data */}
                        <p className="text-gray-600 text-sm">Seat: {exam.seatNumber}</p> {/* Smaller text */}
                      </>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center mb-2 text-gray-700"> {/* Adjusted margin and text color */}
                      <Clock className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="font-medium">Applied On</h3> {/* Changed heading */}
                    </div>
                    {/* Format appliedAt timestamp received from backend */}
                    <p className="text-gray-600 text-sm">
                       {exam.appliedAt ? new Date(exam.appliedAt).toLocaleDateString() : 'N/A'}
                    </p> {/* Smaller text */}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t space-y-4 sm:space-y-0"> {/* Added spacing */}
                <Link
                    to={`/status/${exam.applicationId}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm" // Smaller text
                  >
                    View Details
                  </Link>

                  {exam.status === 'approved' && exam.hallTicketUrl ? ( // Only show button if approved AND hallTicketUrl exists
                    <button
                      onClick={() => handleDownloadHallTicket(exam)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm" // Smaller text and button
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Hall Ticket
                    </button>
                  ) : exam.status === 'pending' ? ( // Show awaiting approval only if pending
                     <div className="text-amber-600 font-medium flex items-center text-sm"> {/* Smaller text */}
                      <Clock className="h-5 w-5 mr-1" />
                      Awaiting Approval
                     </div>
                  ) : null /* Don't show anything for rejected status */ }
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Registered Exams Found</h2>
          <p className="text-gray-600 mb-6">You haven't registered for any exams yet or no exams match your search criteria.</p>
          <Link
            to="/register-exam" // Assuming you have a route for registration
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Register for an Exam
          </Link>
        </div>
      )}
    </div>
  );
};

export default RegisteredExams;