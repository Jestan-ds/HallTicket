// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Card, CardContent, CardHeader } from '../UI/Card';
// import { FileText, Users, ClipboardList, CheckCircle, Send } from 'lucide-react'; // Import Send icon
// import type { JSX } from 'react';

// // Define a type for the Exam data received from the backend's getExams endpoint
// interface Exam {
//   id: string;
//   name: string; // exam_name from backend
//   exam_mode: 'online' | 'offline';
//   exam_date: string; // Formatted date string from backend (e.g., "5/10/2025")
//   exam_date_raw: string; // Added: Assuming backend provides raw ISO date string (e.g., "2025-05-10") - More reliable for comparison
//   exam_time: string | null; // Formatted time string from backend (e.g., "10:00 AM")
//   exam_duration: number;
//   exam_fee: number;
//   exam_registrationEndDate: string; // Formatted date string
//   exam_registrationEndDate_raw?: string; // Added: Assuming backend provides raw ISO date string for reg end date
//   exam_category: string;
//   exam_description: string | null;
//   exam_prerequisites: string | null;
//   locations?: Array<{ location: string; total_seats: number; filled_seats: number }>; // Included for offline exams
//   total_seats?: number; // Calculated total seats for offline exams
//   filled_seats?: number; // Calculated filled seats for offline exams
// }

// // Define a type for the stats data
// interface Stat {
//   title: string;
//   value: number;
//   icon: JSX.Element;
// }

// const AdminDashboard: React.FC = () => {
//   // State to hold fetched data
//   const [exams, setExams] = useState<Exam[]>([]);
//   const [stats, setStats] = useState<Stat[]>([
//     { title: 'Total Exams', value: 0, icon: <FileText size={24} className="text-blue-500" /> },
//     { title: 'Total Students', value: 0, icon: <Users size={24} className="text-green-500" /> },
//     { title: 'Pending Registrations', value: 0, icon: <ClipboardList size={24} className="text-yellow-500" /> },
//     { title: 'Approved Registrations', value: 0, icon: <CheckCircle size={24} className="text-purple-500" /> },
//   ]);
//   const [loadingExams, setLoadingExams] = useState(true);
//   const [loadingStats, setLoadingStats] = useState(true);
//   const [errorExams, setErrorExams] = useState<string | null>(null);
//   const [errorStats, setErrorStats] = useState<string | null>(null);

//   // State for Notification Form
//   const [notificationMessage, setNotificationMessage] = useState('');
//   const [notificationTarget, setNotificationTarget] = useState<'all' | string>('all'); // 'all' or exam ID
//   const [sendingNotification, setSendingNotification] = useState(false);
//   const [notificationStatus, setNotificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
//   const [notificationError, setNotificationError] = useState<string | null>(null);


//   // Effect to fetch EXAM data when the component mounts
//   useEffect(() => {
//     const fetchExams = async () => {
//       setLoadingExams(true);
//       setErrorExams(null);
//       try {
//         // Correct endpoint for exams - ensure it's correct for your backend
//         const response = await fetch('http://localhost:5000/api/exam/',{
//           method: 'GET',
//           credentials: 'include', // Include cookies for authentication
//           headers: {
//             'Content-Type': 'application/json',
//             // Add any other headers if needed
//           },
//         });

//         if (!response.ok) {
//           const contentType = response.headers.get("content-type");
//           if (contentType && contentType.indexOf("application/json") !== -1) {
//              const errorData = await response.json();
//              throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//           } else {
//              throw new Error(`Received non-JSON response (status: ${response.status}). Is the backend running and the endpoint correct?`);
//           }
//         }

//         const result = await response.json();
//         const fetchedExams: Exam[] = result.data;

//         setExams(fetchedExams);

//         // Update the "Total Exams" stat with the actual count
//         setStats(prevStats =>
//           prevStats.map(stat =>
//             stat.title === 'Total Exams' ? { ...stat, value: fetchedExams.length } : stat
//           )
//         );

//       } catch (err) {
//         setErrorExams(err instanceof Error ? err.message : 'An error occurred while fetching exams');
//         console.error("Error fetching exams:", err);
//       } finally {
//         setLoadingExams(false);
//       }
//     };

//     fetchExams();
//   }, []);

//   // Effect to fetch STATS data when the component mounts
//   useEffect(() => {
//     const fetchStats = async () => {
//       setLoadingStats(true);
//       setErrorStats(null);
//       try {
//         // Fetch Total Students - Ensure this endpoint is correct for your backend
//         const studentsResponse = await fetch('http://localhost:5000/api/exam/admin/getStudents', {
//           method: 'GET',
//           credentials: 'include', // Include cookies for authentication
//           headers: {
//             'Content-Type': 'application/json',
//             // Add any other headers if needed
//           },
//           });
//         if (!studentsResponse.ok) {
//              const errorData = await studentsResponse.json();
//              throw new Error(errorData.error || `HTTP error fetching total students! status: ${studentsResponse.status}`);
//         }
//         const studentsResult = await studentsResponse.json();
//         const totalStudents = studentsResult.data?.totalStudents || 0;

//         // Fetch Registration Counts (Pending, Approved) - Ensure this endpoint is correct
//         const registrationsResponse = await fetch('http://localhost:5000/api/exam/admin/getRegistrations');
//          if (!registrationsResponse.ok) {
//              const errorData = await registrationsResponse.json();
//              throw new Error(errorData.error || `HTTP error fetching registration counts! status: ${registrationsResponse.status}`);
//         }
//         const registrationsResult = await registrationsResponse.json();
//         const registrationCounts = registrationsResult.data || { pending: 0, approved: 0 }; // Default to 0 if data is missing


//         // Update the stats state with fetched values
//         setStats(prevStats =>
//           prevStats.map(stat => {
//             if (stat.title === 'Total Students') {
//               return { ...stat, value: totalStudents };
//             }
//             if (stat.title === 'Pending Registrations') {
//               return { ...stat, value: registrationCounts.pending };
//             }
//             if (stat.title === 'Approved Registrations') {
//               return { ...stat, value: registrationCounts.approved };
//             }
//             return stat; // Return other stats unchanged
//           })
//         );

//       } catch (err) {
//         setErrorStats(err instanceof Error ? err.message : 'An error occurred while fetching stats');
//         console.error("Error fetching stats:", err);
//       } finally {
//         setLoadingStats(false);
//       }
//     };

//     fetchStats();
//   }, []);


//   // Handle Notification Send
//   const handleSendNotification = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSendingNotification(true);
//     setNotificationStatus('idle');
//     setNotificationError(null);

//     if (!notificationMessage.trim()) {
//       setNotificationError('Notification message cannot be empty.');
//       setSendingNotification(false);
//       return;
//     }

//     try {
//       // Replace with your actual backend API endpoint for sending notifications
//       const response = await fetch('http://localhost:5000/api/admin/notifications/send', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           // Include authentication headers if needed (e.g., Authorization: `Bearer ${token}`)
//         },
//         body: JSON.stringify({
//           message: notificationMessage,
//           target: notificationTarget, // 'all' or exam ID
//         }),
//       });

//       if (!response.ok) {
//          const errorData = await response.json();
//          throw new Error(errorData.error || `Failed to send notification. Status: ${response.status}`);
//       }

//       setNotificationStatus('success');
//       setNotificationMessage(''); // Clear message on success
//       setNotificationTarget('all'); // Reset target
//       // Optional: Show a success message to the user

//     } catch (err) {
//       setNotificationStatus('error');
//       setNotificationError(err instanceof Error ? err.message : 'An error occurred while sending notification.');
//       console.error("Error sending notification:", err);
//     } finally {
//       setSendingNotification(false);
//     }
//   };


//   // Filter exams for upcoming ones using the raw date string for reliable comparison
//   const upcomingExams = exams.filter(exam => {
//     const dateForComparison = exam.exam_date_raw || exam.exam_date;
//     if (!exam.exam_date_raw) {
//         console.warn(`exam_date_raw not available for exam ${exam.id || exam.name}. Using formatted date for comparison.`);
//     }

//     const examDate = new Date(dateForComparison);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     examDate.setHours(0, 0, 0, 0);
//     return examDate >= today;
//   }).sort((a, b) => {
//      const dateA = new Date(a.exam_date_raw || a.exam_date).getTime();
//      const dateB = new Date(b.exam_date_raw || b.exam_date).getTime();
//      return dateA - dateB;
//   });


//   // Determine overall loading and error states
//   const isLoading = loadingExams || loadingStats;
//   const hasError = errorExams || errorStats;

//   if (isLoading) {
//     return <div className="flex justify-center items-center h-screen">Loading Dashboard...</div>;
//   }

//   if (hasError) {
//     return <div className="text-red-600 text-center">Error: {errorExams || errorStats}</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">Admin Dashboard</h1>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <Card key={index}>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">{stat.title}</p>
//                   <p className="text-3xl font-bold mt-1">{stat.value}</p>
//                 </div>
//                 <div className="p-3 rounded-full bg-gray-50">{stat.icon}</div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Notification Creation Section */}
//       <Card>
//         <CardHeader>
//           <h2 className="text-lg font-medium">Send Notifications</h2>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSendNotification} className="space-y-4">
//             <div>
//               <label htmlFor="notificationMessage" className="block text-sm font-medium text-gray-700">
//                 Message
//               </label>
//               <textarea
//                 id="notificationMessage"
//                 rows={4}
//                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                 value={notificationMessage}
//                 onChange={(e) => setNotificationMessage(e.target.value)}
//                 required
//               ></textarea>
//             </div>

//             <div>
//               <label htmlFor="notificationTarget" className="block text-sm font-medium text-gray-700">
//                 Target Audience
//               </label>
//               <select
//                 id="notificationTarget"
//                 className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
//                 value={notificationTarget}
//                 onChange={(e) => setNotificationTarget(e.target.value)}
//               >
//                 <option value="all">All Students</option>
//                 {/* Populate with exams for targeting specific groups */}
//                 {exams.map(exam => (
//                    <option key={exam.id} value={exam.id}>Students registered for {exam.name}</option>
//                 ))}
//               </select>
//             </div>

//             {notificationStatus === 'success' && (
//               <div className="text-green-600 text-sm">Notification sent successfully!</div>
//             )}
//             {notificationStatus === 'error' && (
//               <div className="text-red-600 text-sm">Error sending notification: {notificationError}</div>
//             )}

//             <button
//               type="submit"
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={sendingNotification}
//             >
//               <Send size={20} className="mr-2" />
//               {sendingNotification ? 'Sending...' : 'Send Notification'}
//             </button>
//           </form>
//         </CardContent>
//       </Card>


//       {/* Upcoming Exams - Using fetched data */}
//       <Card>
//         <CardHeader>
//           <h2 className="text-lg font-medium">Upcoming Exams</h2>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Seats</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {upcomingExams.length > 0 ? (
//                   upcomingExams.map((exam) => (
//                     <tr key={exam.id}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{exam.name}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.exam_date}</td> {/* Display formatted date */}
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.exam_time || 'N/A'}</td> {/* Display formatted time */}
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{exam.exam_mode}</td>
//                        {/* Display filled_seats and total_seats for offline exams */}
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                          {exam.exam_mode === 'offline' ? (exam.filled_seats ?? 'N/A') : 'N/A'}
//                       </td>
//                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                          {exam.exam_mode === 'offline' ? (exam.total_seats ?? 'N/A') : 'N/A'}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
//                       No upcoming exams found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//            {/* TODO: Add pagination or more advanced table features */}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../UI/Card';
import { FileText, Users, ClipboardList, CheckCircle, Send, Calendar } from 'lucide-react'; // Import Send and Calendar icons
import type { JSX } from 'react';

// Define a type for the Exam data received from the backend's getExams endpoint
// Keep this interface as it's needed for populating the notification target dropdown
interface Exam {
  id: string;
  name: string; // exam_name from backend
  exam_mode: 'online' | 'offline';
  exam_date: string; // Formatted date string from backend (e.g., "5/10/2025")
  exam_date_raw: string; // Assuming backend provides raw ISO date string (e.g., "2025-05-10") - More reliable for comparison
  exam_time: string | null; // Formatted time string from backend (e.g., "10:00 AM")
  exam_duration: number;
  exam_fee: number;
  exam_registrationEndDate: string; // Formatted date string
  exam_registrationEndDate_raw?: string; // Added: Assuming backend provides raw ISO date string for reg end date
  exam_category: string;
  exam_description: string | null;
  exam_prerequisites: string | null;
  locations?: Array<{ location: string; total_seats: number; filled_seats: number }>; // Included for offline exams
  total_seats?: number; // Calculated total seats for offline exams
  filled_seats?: number; // Calculated filled seats for offline exams
}

// Define a type for the stats data
interface Stat {
  title: string;
  value: number;
  icon: JSX.Element;
}

const AdminDashboard: React.FC = () => {
  // State to hold fetched data (exams needed for the target dropdown and upcoming list)
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<Stat[]>([
    { title: 'Total Exams', value: 0, icon: <FileText size={24} className="text-blue-500" /> },
    { title: 'Total Students', value: 0, icon: <Users size={24} className="text-green-500" /> },
    { title: 'Pending Registrations', value: 0, icon: <ClipboardList size={24} className="text-yellow-500" /> },
    { title: 'Approved Registrations', value: 0, icon: <CheckCircle size={24} className="text-purple-500" /> },
  ]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorExams, setErrorExams] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // State for Notification Form
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTarget, setNotificationTarget] = useState<'all' | string>('all'); // 'all' or exam ID
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [notificationError, setNotificationError] = useState<string | null>(null);


  // Effect to fetch EXAM data when the component mounts (needed for target dropdown and upcoming list)
  useEffect(() => {
    const fetchExams = async () => {
      // Fetch token inside the effect
      const token = localStorage.getItem('authToken'); // Assuming authToken is the key used

      setLoadingExams(true);
      setErrorExams(null);
      try {
        const response = await fetch('http://localhost:5000/api/exam/',{
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
            // Add Authorization header if this endpoint is protected
            ...(token && { 'Authorization': `Bearer ${token}` }), // Conditionally add header if token exists
          },
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
             const errorData = await response.json();
             throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          } else {
             throw new Error(`Received non-JSON response (status: ${response.status}) from exams endpoint.`);
          }
        }

        const result = await response.json();
        const fetchedExams: Exam[] = result.data;

        setExams(fetchedExams);

        // Update the "Total Exams" stat with the actual count
        // This might be better fetched from a dedicated stats endpoint if available
        setStats(prevStats =>
          prevStats.map(stat =>
            stat.title === 'Total Exams' ? { ...stat, value: fetchedExams.length } : stat
          )
        );

      } catch (err) {
        setErrorExams(err instanceof Error ? err.message : 'An error occurred while fetching exams');
        console.error("Error fetching exams:", err);
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []); // Empty dependency array means this effect runs only once on mount

  // Effect to fetch STATS data when the component mounts
  useEffect(() => {
    const fetchStats = async () => {
       // Fetch token inside the effect
       const token = localStorage.getItem('authToken'); // Assuming authToken is the key used

      setLoadingStats(true);
      setErrorStats(null);
      try {
        // Fetch Total Students - Ensure this endpoint is correct for your backend
        const studentsResponse = await fetch('http://localhost:5000/api/exam/admin/getStudents', {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
             // Add Authorization header if this endpoint is protected
             ...(token && { 'Authorization': `Bearer ${token}` }), // Conditionally add header if token exists
          },
          });
        if (!studentsResponse.ok) {
             const errorData = await studentsResponse.json();
             throw new Error(errorData.error || `HTTP error fetching total students! status: ${studentsResponse.status}`);
        }
        const studentsResult = await studentsResponse.json();
        const totalStudents = studentsResult.data?.totalStudents || 0;

        // Fetch Registration Counts (Pending, Approved) - Ensure this endpoint is correct
        const registrationsResponse = await fetch('http://localhost:5000/api/exam/admin/getRegistrations');
         if (!registrationsResponse.ok) {
             const errorData = await registrationsResponse.json();
             throw new Error(errorData.error || `HTTP error fetching registration counts! status: ${registrationsResponse.status}`);
        }
        const registrationsResult = await registrationsResponse.json();
        const registrationCounts = registrationsResult.data || { pending: 0, approved: 0 }; // Default to 0 if data is missing


        // Update the stats state with fetched values
        setStats(prevStats =>
          prevStats.map(stat => {
            if (stat.title === 'Total Students') {
              return { ...stat, value: totalStudents };
            }
            if (stat.title === 'Pending Registrations') {
              return { ...stat, value: registrationCounts.pending };
            }
            if (stat.title === 'Approved Registrations') {
              return { ...stat, value: registrationCounts.approved };
            }
            return stat; // Return other stats unchanged
          })
        );

      } catch (err) {
        setErrorStats(err instanceof Error ? err.message : 'An error occurred while fetching stats');
        console.error("Error fetching stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array means this effect runs only once on mount


  // Handle Notification Send
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotification(true);
    setNotificationStatus('idle'); // Reset status before sending
    setNotificationError(null);

    if (!notificationMessage.trim()) {
      setNotificationError('Notification message cannot be empty.');
      setSendingNotification(false);
      return;
    }

    // Fetch token inside the handler
    const token = localStorage.getItem('authToken'); // Assuming authToken is the key used

    try {
      // Replace with your actual backend API endpoint for sending notifications
      const response = await fetch('http://localhost:5000/api/notifications/send', { // Corrected endpoint based on previous discussion
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
           // Include authentication headers if needed (e.g., Authorization: `Bearer ${token}`)
           ...(token && { 'Authorization': `Bearer ${token}` }), // Conditionally add header if token exists
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          message: notificationMessage,
          target: notificationTarget, // 'all' or exam ID
        }),
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ message: 'Could not parse error body' }));
         throw new Error(errorData.error || `Failed to send notification. Status: ${response.status}`);
      }

      // Set status to success - This component doesn't display the list,
      // but this status could be used to show a success message on this page.
      setNotificationStatus('success');
      setNotificationMessage(''); // Clear message on success
      setNotificationTarget('all'); // Reset target
      // Optional: Show a success message to the user (e.g., using a toast)

    } catch (err) {
      setNotificationStatus('error');
      setNotificationError(err instanceof Error ? err.message : 'An error occurred while sending notification.');
      console.error("Error sending notification:", err);
    } finally {
      setSendingNotification(false);
    }
  };


  // Filter exams for upcoming ones using the raw date string for reliable comparison
  const upcomingExams = exams.filter(exam => {
    // Use exam_date_raw (ISO string) for reliable date comparison
    // Fallback to exam_date if raw is not available, but warn
    const dateForComparison = exam.exam_date_raw || exam.exam_date;
    if (!exam.exam_date_raw) {
        // This warning is expected if exam_date_raw is not provided by the backend
        console.warn(`exam_date_raw not available for exam ${exam.id || exam.name}. Using formatted date for comparison.`);
    }

    // Attempt to create a Date object from the chosen date string
    const examDate = new Date(dateForComparison);
    const today = new Date();
    // Set time to 00:00:00 for comparison to only compare dates
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    // Return true if the date is valid and is today or in the future
    return !isNaN(examDate.getTime()) && examDate >= today;
  }).sort((a, b) => {
     // Sort by exam_date_raw (ISO string) for reliable chronological order
     const dateA = new Date(a.exam_date_raw || a.exam_date).getTime();
     const dateB = new Date(b.exam_date_raw || b.exam_date).getTime();
     // Handle cases where date parsing might fail for sorting (though filter should prevent this)
     if (isNaN(dateA) || isNaN(dateB)) return 0;
     return dateA - dateB;
  });


  // Determine overall loading and error states
  const isLoading = loadingExams || loadingStats;
  const hasError = errorExams || errorStats;

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Dashboard...</div>;
  }

  if (hasError) {
    return <div className="text-red-600 text-center">Error: {hasError}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-gray-50">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notification Creation Section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Send Notifications</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label htmlFor="notificationMessage" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="notificationMessage"
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <div>
              <label htmlFor="notificationTarget" className="block text-sm font-medium text-gray-700">
                Target Audience
              </label>
              <select
                id="notificationTarget"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={notificationTarget}
                onChange={(e) => setNotificationTarget(e.target.value)}
              >
                <option value="all">All Students</option>
                {/* Populate with exams for targeting specific groups */}
                {exams.map(exam => (
                   <option key={exam.id} value={exam.id}>Students registered for {exam.name}</option>
                ))}
              </select>
            </div>

            {notificationStatus === 'success' && (
              <div className="text-green-600 text-sm">Notification sent successfully!</div>
            )}
            {notificationStatus === 'error' && (
              <div className="text-red-600 text-sm">Error sending notification: {notificationError}</div>
            )}

            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={sendingNotification}
            >
              <Send size={20} className="mr-2" />
              {sendingNotification ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Upcoming Exams - Using fetched data */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Upcoming Exams</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Seats</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Removed extra whitespace/newlines between <td> tags */}
                {upcomingExams.length > 0 ? (
                  upcomingExams.map((exam) => (
                    <tr key={exam.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{exam.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.exam_date}</td> {/* Display formatted date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.exam_time || 'N/A'}</td> {/* Display formatted time */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{exam.exam_mode}</td>
                       {/* Display filled_seats and total_seats for offline exams */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {exam.exam_mode === 'offline' ? (exam.filled_seats ?? 'N/A') : 'N/A'}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {exam.exam_mode === 'offline' ? (exam.total_seats ?? 'N/A') : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No upcoming exams found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
           {/* TODO: Add pagination or more advanced table features */}
        </CardContent>
      </Card>

      {/* Sent Notifications section removed - moved to a dedicated page */}

    </div>
  );
};

export default AdminDashboard;
