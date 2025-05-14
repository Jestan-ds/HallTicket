import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Clock, AlertCircle, CheckCircle, User, MapPin, Award, Ticket, Mail, MailOpen } from 'lucide-react';
// Assuming RegisteredExams is a separate component, no need to import it here if not directly used in JSX
// import RegisteredExams from './RegisteredExams';
// Assuming Exam type is defined in '../types'
import { Exam } from '../types';
// Import the useAuth hook
import { useAuth } from '../context/AuthContext'; // Adjust the path to your AuthContext

// Define a type for the notification data received from the backend
interface Notification {
  id: string;
  message: string;
  target: string; // 'all' or exam ID
  createdAt: string; // Raw timestamp string (ISO format is good)
  createdAtFormatted: string; // Formatted date/time string from backend
  readAt: string | null; // Raw timestamp string or null
  read: boolean; // Boolean flag from backend
  readAtFormatted?: string; // Formatted read date/time string from backend
}


const Dashboard1 = () => {
  // Get auth state and user from AuthContext
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // State to hold user data (can be derived from context user)
  const [userData, setUserData] = useState<any>(null); // Initialize as null

  // Explicitly initialize states as empty arrays
  const [registeredExams, setRegisteredExams] = useState<any[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [availableExams, setAvailableExams] = useState<any[]>([]);

  // State to hold fetched notifications, initialized as an empty array
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Separate loading and error states for different data fetches
  const [loadingUserStats, setLoadingUserStats] = useState(true);
  const [errorUserStats, setErrorUserStats] = useState<string | null>(null);

  const [loadingAvailableExams, setLoadingAvailableExams] = useState(true);
  const [errorAvailableExams, setErrorAvailableExams] = useState<string | null>(null);

  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [errorNotifications, setErrorNotifications] = useState<string | null>(null);

  // Overall loading and error states derived from individual states
  const [overallLoading, setOverallLoading] = useState(true);
  const [overallError, setOverallError] = useState<string | null>(null);


  const navigate = useNavigate(); // Use useNavigate hook

  // Effect to update userData when the user from AuthContext changes
  useEffect(() => {
      setUserData(user);
  }, [user]);


  // Effect to fetch User Exam Stats and Available Exams
  useEffect(() => {
    const fetchData = async () => {
      // Wait for authentication state to be ready
      if (authLoading) {
          return;
      }

      const token = localStorage.getItem('authToken');

      // Check for token and user ID before fetching protected data
      if (!isAuthenticated || !user?.id || !token) {
        console.warn("Authentication failed or user ID not found. Redirecting to login.");
        navigate('/login');
        // Set all loading states to false as we are redirecting
        setLoadingUserStats(false);
        setLoadingAvailableExams(false);
        setLoadingNotifications(false); // Also set notification loading to false
        return;
      }

      // --- Fetch User Exam Stats ---
      setLoadingUserStats(true);
      setErrorUserStats(null);
      try {
        const userStatsResponse = await fetch(`http://localhost:5000/api/examRegistration/getUserExamStats/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
            credentials: 'include', // Include if your backend uses cookies/sessions
        });

        if (!userStatsResponse.ok) {
          console.warn(`Failed to fetch user stats for user ID ${user.id}: ${userStatsResponse.status}`);
            const errorBody = await userStatsResponse.json().catch(() => ({ message: 'Could not parse error body' }));
            console.error('User stats fetch error body:', errorBody);
          setRegisteredExams([]);
          setUpcomingExams([]);
          setErrorUserStats(`Could not load registered exams (${userStatsResponse.status})`);

        } else {
          const data = await userStatsResponse.json();
          const registered: any[] = Array.isArray(data) ? data : [];
          setRegisteredExams(registered);

          const upcoming = registered.filter((exam: any) => {
              try {
                 const examDate = new Date(exam.exam_date);
                 return !isNaN(examDate.getTime()) && examDate > new Date();
              } catch (e) {
                 console.error("Error parsing exam date for upcoming filter:", exam.exam_date, e);
                 return false;
              }
          });
          setUpcomingExams(upcoming);
        }

      } catch (error: any) {
         console.error('Error during user stats fetching:', error);
         setErrorUserStats(`Failed to load user exam data: ${error.message}`);
         setRegisteredExams([]);
         setUpcomingExams([]);
      } finally {
         setLoadingUserStats(false);
      }


      // --- Fetch All Available Exams ---
      setLoadingAvailableExams(true);
      setErrorAvailableExams(null);
      try {
        const allExamsResponse = await fetch('http://localhost:5000/api/exam/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include', // Match credentials setting if necessary
        });

        if (!allExamsResponse.ok) {
            console.error(`Failed to fetch available exams: ${allExamsResponse.status}`);
            const errorBody = await allExamsResponse.json().catch(() => ({ message: 'Could not parse error body' }));
            console.error('Available exams fetch error body:', errorBody);
            setAvailableExams([]); // Set to empty array on failure
            setErrorAvailableExams(`Could not load available exams (${allExamsResponse.status})`);

        } else {
            const allExamsResult = await allExamsResponse.json();
            const allExams: any[] = Array.isArray(allExamsResult.data) ? allExamsResult.data : [];

            // Filter future exams and exclude those the user is already registered for (optional but good UX)
            const futureExams = allExams.filter((exam: any) => {
                try {
                    const examDate = new Date(exam.exam_date);
                    if (isNaN(examDate.getTime()) || examDate < new Date()) {
                        return false; // Exclude if date is invalid or in the past
                    }
                } catch (e) {
                    console.error("Error parsing available exam date:", exam.exam_date, e);
                    return false; // Exclude if date is invalid
                }
                // Check if user is already registered for this exam ID
                // Use the state variable `registeredExams` which was set by the previous fetch
                const isRegistered = registeredExams.some(regExam => regExam.exam_id === exam.id);
                return !isRegistered; // Include only if not already registered
            });
            setAvailableExams(futureExams);
            console.log('Available exams:', futureExams); // Debugging log for available exams
        }

      } catch (error: any) {
         console.error('Error during available exams fetching:', error);
         setErrorAvailableExams(`Failed to load available exams: ${error.message}`);
         setAvailableExams([]);
      } finally {
         setLoadingAvailableExams(false);
      }
    };

    // Fetch initial data on mount or when auth state changes
    fetchData();

    // Add dependencies: authLoading, isAuthenticated, user?.id, and registeredExams.length
    // registeredExams.length is included because the available exams filtering depends on it.
  }, [authLoading, isAuthenticated, user?.id, navigate, registeredExams.length]);


  // Effect to fetch NOTIFICATIONS separately
  useEffect(() => {
      // Wait for authentication state to be ready
      if (authLoading) {
          return;
      }

      const fetchNotifications = async () => {
          const token = localStorage.getItem('authToken');

           if (!isAuthenticated || !user?.id || !token) {
              setLoadingNotifications(false);
              return; // Don't fetch if not authenticated
           }

          setLoadingNotifications(true);
          setErrorNotifications(null);
          try {
              const response = await fetch('http://localhost:5000/api/notifications/', {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                       Authorization: `Bearer ${token}`, // Include auth token
                  },
                  credentials: 'include',
              });

              if (!response.ok) {
                  const errorData = await response.json().catch(() => ({ message: 'Could not parse error body' }));
                  throw new Error(errorData.error || `Failed to fetch notifications. Status: ${response.status}`);
              }

              const result = await response.json();
              // Assuming the backend returns an object like { success: true, data: [...] }
              const fetchedNotifications: Notification[] = Array.isArray(result.data) ? result.data : [];

              setNotifications(fetchedNotifications);

          } catch (err: any) {
              setErrorNotifications(err instanceof Error ? err.message : 'An error occurred while fetching notifications');
              console.error("Error fetching notifications:", err);
          } finally {
              setLoadingNotifications(false);
          }
      };

      fetchNotifications();
       // Add dependencies: authLoading, isAuthenticated, user?.id
  }, [authLoading, isAuthenticated, user?.id]);


  // Effect to update overall loading state based on individual fetches
  useEffect(() => {
      setOverallLoading(loadingUserStats || loadingAvailableExams || loadingNotifications);
  }, [loadingUserStats, loadingAvailableExams, loadingNotifications]);

  // Effect to update overall error state based on individual errors
   useEffect(() => {
       // Combine error messages from all sources
       const errors = [errorUserStats, errorAvailableExams, errorNotifications].filter(Boolean);
       setOverallError(errors.length > 0 ? errors.join('; ') : null);
   }, [errorUserStats, errorAvailableExams, errorNotifications]);


  // Handle marking a notification as read
  const handleMarkNotificationAsRead = async (notifId: string) => {
    const token = localStorage.getItem('authToken');
    const notificationToMark = notifications.find(notif => notif.id === notifId);

    // Prevent marking if already read or if not authenticated
    if (!isAuthenticated || !token || !notificationToMark || notificationToMark.read) {
        return;
    }

    // Optimistically update the UI
    setNotifications(prevNotifications =>
      prevNotifications.map(notif =>
        notif.id === notifId ? { ...notif, read: true, readAt: new Date().toISOString(), readAtFormatted: new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()) } : notif
      )
    );

    try {
        // Replace with your actual backend API endpoint for marking as read
        const response = await fetch(`http://localhost:5000/api/student/notifications/${notifId}/read`, {
            method: 'PATCH', // Use PATCH for partial updates
            headers: {
                'Content-Type': 'application/json',
                 Authorization: `Bearer ${token}`, // Include auth token
            },
             credentials: 'include',
        });

        if (!response.ok) {
            // If backend update fails, revert the optimistic UI update
            setNotifications(prevNotifications =>
                prevNotifications.map(notif =>
                    notif.id === notifId ? { ...notif, read: false, readAt: null, readAtFormatted: 'N/A' } : notif
                )
            );
             const errorData = await response.json().catch(() => ({ message: 'Could not parse error body' }));
            throw new Error(errorData.error || `Failed to mark notification as read. Status: ${response.status}`);
        }

        // Backend confirmed, UI is already updated optimistically

    } catch (err) {
        console.error(`Error marking notification ${notifId} as read:`, err);
        // Error message could be shown to the user (e.g., using a toast notification)
    }
  };


  if (overallLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Optional: Display a general error message if an unhandled error occurred
    if (overallError) {
        return (
            <div className="max-w-6xl mx-auto p-6 text-red-700 bg-red-100 border border-red-400 rounded-md">
                <p>{overallError}</p>
                <p className="mt-2">Please try refreshing the page or contact support if the problem persists.</p>
            </div>
        );
    }


  return (
    <div className="max-w-6xl mx-auto p-6"> {/* Added some padding */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {userData?.name || 'User'}</h1> {/* Default to 'User' if name is missing */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Your Stats</h2>
            <User className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Registered Exams</span>
              {/* Use registeredExams.length directly as state is guaranteed to be an array */}
              <span className="font-semibold">{registeredExams.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approved Exams</span>
              <span className="font-semibold">
                  {/* Use filter directly */}
                {registeredExams.filter((exam: any) => exam.status === 'approved').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Exams</span>
              <span className="font-semibold">
                  {/* Use filter directly */}
                  {registeredExams.filter((exam: any) => exam.status === 'pending').length}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link to="/profile" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View Profile →
            </Link>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Upcoming Exams</h2>
            <Calendar className="h-5 w-5 text-indigo-500" />
          </div>
          {/* Check upcomingExams.length directly */}
          {upcomingExams.length > 0 ? (
            <div className="space-y-3 max-h-[200px] overflow-y-auto"> {/* Added overflow to prevent tall lists */}
              {upcomingExams.map((exam:any) => (
                // Ensure key is unique, using exam.id if available, otherwise index (less ideal)
                <div key={exam.id || `upcoming-${exam.exam_name}`} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{exam.exam_name}</h3>
                      <p className="text-sm text-gray-600">{exam.exam_date} at {exam.exam_time}</p>
                    </div>
                    {exam.status === 'approved' ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming exams found among your registrations.</p>
          )}
          <div className="mt-4 pt-4 border-t">
            <Link to="/my-exams" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All My Registered Exams → {/* Link to my-exams page */}
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Notifications</h2>
            <div className="relative">
              <AlertCircle className="h-5 w-5 text-indigo-500" />
              {/* Display unread count */}
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
          </div>
          {loadingNotifications ? (
               <div className="flex justify-center items-center py-4">
                   <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
               </div>
          ) : errorNotifications ? (
               <div className="text-red-600 text-sm text-center">{errorNotifications}</div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3 max-h-[200px] overflow-y-auto"> {/* Added overflow */}
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  // Use read status for styling
                  className={`p-3 rounded-md cursor-pointer ${notif.read ? 'bg-gray-50' : 'bg-indigo-50 border-l-4 border-indigo-500'}`}
                  onClick={() => handleMarkNotificationAsRead(notif.id)} // Use the async handler
                >
                   <div className="flex items-center">
                       {/* Icon based on read status */}
                       <div className="flex-shrink-0 mr-2">
                           {notif.read ? (
                              <MailOpen size={16} className="text-gray-500" />
                           ) : (
                              <Mail size={16} className="text-blue-500" />
                           )}
                       </div>
                       <p className={`text-sm flex-1 ${notif.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                         {notif.message}
                       </p>
                   </div>
                  {/* Display formatted date/time */}
                  <p className="text-xs text-gray-500 mt-1">{notif.createdAtFormatted}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No notifications</p>
          )}
           <div className="mt-4 pt-4 border-t">
             {/* Link to the dedicated notifications page */}
             <Link to="/notifications" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View All Notifications →
             </Link>
           </div>
        </div>
      </div>

      {/* Available Exams */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Available Exams</h2>
          <BookOpen className="h-6 w-6 text-indigo-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Deadline
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
             {/* Check availableExams.length directly */}
            <tbody className="bg-white divide-y divide-gray-200">
              {availableExams.length > 0 ? (
                  availableExams.map((exam) => (
                    // Ensure key is unique
                    <tr key={exam.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{exam.exam_date}</div>
                        <div className="text-sm text-gray-500">{exam.exam_time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{exam.exam_registrationEndDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           {/* Check if registration deadline is past */}
                           {new Date(exam.exam_registrationEndDate) >= new Date() ? (
                              <Link
                                 to={`/register-exam?examId=${exam.id}`}
                                 className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
                              >
                                 Register
                              </Link>
                           ) : (
                              <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-md cursor-not-allowed">
                                 Closed
                              </span>
                           )}
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                           No available exams found.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <Link to="/register-exam" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Browse All Exams
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link to="/register-exam" className="bg-indigo-600 text-white rounded-lg shadow-md p-6 hover:bg-indigo-700 transition-colors">
          <BookOpen className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Register for Exam</h3>
          <p className="text-indigo-100 text-sm">Browse and register for available exams</p>
        </Link>

        <Link to="/my-exams" className="bg-green-600 text-white rounded-lg shadow-md p-6 hover:bg-green-700 transition-colors">
          <Ticket className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">My Registered Exams</h3>
          <p className="text-green-100 text-sm">View your registered and upcoming exams</p>
        </Link>

        <Link to="/profile" className="bg-amber-600 text-white rounded-lg shadow-md p-6 hover:bg-amber-700 transition-colors">
          <User className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Update Profile</h3>
          <p className="text-amber-100 text-sm">Manage your personal information</p>
        </Link>

        {/* Placeholder - if functionality exists, make it a Link */}
        <div className="bg-gray-700 text-white rounded-lg shadow-md p-6">
          <MapPin className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Exam Centers</h3>
          <p className="text-gray-300 text-sm">Find exam centers near your location</p>
        </div>
      </div>

      {/* Important Announcements - Still using mock data */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Important Announcements</h2>
          <Award className="h-6 w-6 text-indigo-500" />
        </div>

        <div className="space-y-4">
          <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-md">
            <h3 className="font-medium text-amber-800">Exam Schedule Update</h3>
            <p className="text-sm text-amber-700 mt-1">
              The Computer Science 501 exam has been rescheduled to June 26, 2025. All registered candidates will receive updated hall tickets.
            </p>
          </div>

          <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-md">
            <h3 className="font-medium text-indigo-800">New Courses Available</h3>
            <p className="text-sm text-indigo-700 mt-1">
              Registration for Advanced Mathematics (MATH601) and Quantum Physics (PHYS701) will open on June 1, 2025.
            </p>
          </div>

          <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-md">
            <h3 className="font-medium text-green-800">ID Requirements</h3>
            <p className="text-sm text-green-700 mt-1">
              All candidates must bring a government-issued photo ID along with their hall ticket to the examination center.
            </p>
          </div>
        </div>
         {/* TODO: Fetch real announcements from backend */}
      </div>
    </div>
  );
};

export default Dashboard1;
