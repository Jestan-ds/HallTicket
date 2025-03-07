import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Calendar, Clock, MapPin, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react';

// Mock registered exams
const REGISTERED_EXAMS = [
  { 
    id: 'app123',
    applicationId: 'APP123XYZ',
    examId: 'math101',
    examName: 'Mathematics 101',
    date: '2025-06-15',
    time: '09:00 AM',
    duration: '3 hours',
    location: 'Main Campus, Building A',
    room: 'Room 101',
    seatNumber: 'A45',
    status: 'approved',
    appliedAt: '2025-05-01T10:30:00Z',
    hallTicketUrl: '#'
  },
  { 
    id: 'app456',
    applicationId: 'APP456ABC',
    examId: 'phys201',
    examName: 'Physics 201',
    date: '2025-06-18',
    time: '10: 00 AM',
    duration: '3 hours',
    location: 'Science Building, Room 302',
    room: 'Room 302',
    seatNumber: 'B12',
    status: 'pending',
    appliedAt: '2025-05-05T14:20:00Z',
    hallTicketUrl: null
  },
  { 
    id: 'app789',
    applicationId: 'APP789DEF',
    examId: 'chem301',
    examName: 'Chemistry 301',
    date: '2025-06-20',
    time: '02:00 PM',
    duration: '3 hours',
    location: 'Science Building, Lab 201',
    room: 'Lab 201',
    seatNumber: 'C08',
    status: 'approved',
    appliedAt: '2025-05-10T09:15:00Z',
    hallTicketUrl: '#'
  }
];

const RegisteredExams = () => {
  const [registeredExams, setRegisteredExams] = useState(REGISTERED_EXAMS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    // Simulate API call to fetch registered exams
    setTimeout(() => {
      setRegisteredExams(REGISTERED_EXAMS);
      setLoading(false);
    }, 800);
  }, []);
  
  // Filter exams based on search and status filter
  const filteredExams = registeredExams.filter(exam => {
    const matchesSearch = exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         exam.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? exam.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleDownloadHallTicket = (exam: typeof REGISTERED_EXAMS[0]) => {
    // In a real app, this would download the hall ticket or redirect to a download endpoint
    alert(`Hall ticket for ${exam.examName} is being downloaded.`);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-full">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 mr-1" />
            <span>Pending</span>
          </div>
        );
    }
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Registered Exams</h1>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by exam name or application ID..."
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
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Exam List */}
      {filteredExams.length > 0 ? (
        <div className="space-y-6">
          {filteredExams.map(exam => (
            <div key={exam.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{exam.examName}</h2>
                    <p className="text-gray-500 mt-1">Application ID: {exam.applicationId}</p>
                  </div>
                  {getStatusBadge(exam.status)}
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="flex items-center mb-3">
                      <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="font-medium text-gray-700">Date & Time</h3>
                    </div>
                    <p className="text-gray-600">{exam.date}</p>
                    <p className="text-gray-600">{exam.time} ({exam.duration})</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-3">
                      <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="font-medium text-gray-700">Location</h3>
                    </div>
                    <p className="text-gray-600">{exam.location}</p>
                    {exam.status === 'approved' && (
                      <>
                        <p className="text-gray-600">{exam.room}</p>
                        <p className="text-gray-600">Seat: {exam.seatNumber}</p>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-3">
                      <Clock className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="font-medium text-gray-700">Application Date</h3>
                    </div>
                    <p className="text-gray-600">{new Date(exam.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <Link 
                    to={`/status/${exam.applicationId}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View Details
                  </Link>
                  
                  {exam.status === 'approved' ? (
                    <button
                      onClick={() => handleDownloadHallTicket(exam)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Hall Ticket
                    </button>
                  ) : (
                    <div className="text-amber-600 font-medium flex items-center">
                      <Clock className="h-5 w-5 mr-1" />
                      Awaiting Approval
                    </div>
                  )}
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
            to="/register-exam"
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