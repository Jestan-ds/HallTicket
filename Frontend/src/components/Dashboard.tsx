import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, Clock, AlertCircle, CheckCircle, User, MapPin, Award } from 'lucide-react';

// Mock user data
const USER_DATA = {
  id: 'user123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  profileCompleted: true
};

// Mock upcoming exams
const UPCOMING_EXAMS = [
  { id: 'math101', name: 'Mathematics 101', date: '2025-06-15', time: '09:00 AM', status: 'approved' },
  { id: 'phys201', name: 'Physics 201', date: '2025-06-18', time: '10:00 AM', status: 'pending' }
];

// Mock available exams
const AVAILABLE_EXAMS = [
  { id: 'chem301', name: 'Chemistry 301', date: '2025-06-20', time: '02:00 PM', registrationEndDate: '2025-06-10' },
  { id: 'bio401', name: 'Biology 401', date: '2025-06-22', time: '11:00 AM', registrationEndDate: '2025-06-12' },
  { id: 'cs501', name: 'Computer Science 501', date: '2025-06-25', time: '01:00 PM', registrationEndDate: '2025-06-15' }
];

// Mock notifications
const NOTIFICATIONS = [
  { id: 'notif1', message: 'Your hall ticket for Mathematics 101 is ready for download', date: '2025-05-20', read: false },
  { id: 'notif2', message: 'Registration for Computer Science 501 is closing soon', date: '2025-05-18', read: true },
  { id: 'notif3', message: 'Your application for Physics 201 is under review', date: '2025-05-15', read: true }
];

const Dashboard = () => {
  const [userData, setUserData] = useState(USER_DATA);
  const [upcomingExams, setUpcomingExams] = useState(UPCOMING_EXAMS);
  const [availableExams, setAvailableExams] = useState(AVAILABLE_EXAMS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    setTimeout(() => {
      // In a real app, these would be fetched from a server
      setUserData(USER_DATA);
      setUpcomingExams(UPCOMING_EXAMS);
      setAvailableExams(AVAILABLE_EXAMS);
      setNotifications(NOTIFICATIONS);
      setLoading(false);
    }, 800);
  }, []);

  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === notifId ? { ...notif, read: true } : notif
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {userData.name}</h1>
      
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
              <span className="font-semibold">{upcomingExams.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Exams</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hall Tickets</span>
              <span className="font-semibold">{upcomingExams.filter(exam => exam.status === 'approved').length}</span>
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
          {upcomingExams.length > 0 ? (
            <div className="space-y-3">
              {upcomingExams.map(exam => (
                <div key={exam.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{exam.name}</h3>
                      <p className="text-sm text-gray-600">{exam.date} at {exam.time}</p>
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
            <p className="text-gray-500 text-center py-4">No upcoming exams</p>
          )}
          <div className="mt-4 pt-4 border-t">
            <Link to="/my-exams" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All Exams →
            </Link>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Notifications</h2>
            <div className="relative">
              <AlertCircle className="h-5 w-5 text-indigo-500" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
          </div>
          {notifications.length > 0 ? (
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-md ${notif.read ? 'bg-gray-50' : 'bg-indigo-50 border-l-4 border-indigo-500'}`}
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{notif.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No notifications</p>
          )}
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
            <tbody className="bg-white divide-y divide-gray-200">
              {availableExams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{exam.date}</div>
                    <div className="text-sm text-gray-500">{exam.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{exam.registrationEndDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/register-exam?examId=${exam.id}`}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
                    >
                      Register
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t text-center">
          <Link to="/register-exam" className="text-indigo-600 hover:text-indigo-800 font-medium">
            View All Available Exams
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
        
        {/* <Link to="/my-exams" className="bg-green-600 text-white rounded-lg shadow-md p-6 hover:bg-green-700 transition-colors">
          <Ticket className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">My Hall Tickets</h3>
          <p className="text-green-100 text-sm">View and download your hall tickets</p>
        </Link> */}
        
        <Link to="/profile" className="bg-amber-600 text-white rounded-lg shadow-md p-6 hover:bg-amber-700 transition-colors">
          <User className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Update Profile</h3>
          <p className="text-amber-100 text-sm">Manage your personal information</p>
        </Link>
        
        <div className="bg-gray-700 text-white rounded-lg shadow-md p-6">
          <MapPin className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Exam Centers</h3>
          <p className="text-gray-300 text-sm">Find exam centers near your location</p>
        </div>
      </div>
      
      {/* Important Announcements */}
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
      </div>
    </div>
  );
};

export default Dashboard;