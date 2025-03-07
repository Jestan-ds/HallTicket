import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ApplicationData {
  applicationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  examId: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  examDetails: {
    id: string;
    name: string;
    date: string;
    time: string;
  };
}

const ApplicationStatus = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) {
      setError('Application ID is missing');
      setLoading(false);
      return;
    }

    // Simulate API call to fetch application data
    setTimeout(() => {
      try {
        const data = localStorage.getItem(applicationId);
        if (!data) {
          setError('Application not found');
        } else {
          // In a real app, this would be fetched from a server
          setApplication(JSON.parse(data));
          
          // Simulate application approval after 5 seconds
          setTimeout(() => {
            const updatedData = JSON.parse(data);
            updatedData.status = 'approved';
            localStorage.setItem(applicationId, JSON.stringify(updatedData));
            setApplication(updatedData);
          }, 5000);
        }
      } catch (err) {
        setError('Failed to load application data');
      } finally {
        setLoading(false);
      }
    }, 1000);
  }, [applicationId]);

  const getStatusBadge = () => {
    if (!application) return null;
    
    switch (application.status) {
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

  const handleDownloadHallTicket = () => {
    if (!application) return;
    
    // In a real app, this would generate a PDF or redirect to a download endpoint
    alert(`Hall ticket for ${application.firstName} ${application.lastName} is being downloaded.`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Application Form
        </Link>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Application Form
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Application Status</h1>
            {getStatusBadge()}
          </div>
          <p className="mt-2">Application ID: {application.applicationId}</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Personal Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{application.firstName} {application.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{application.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{application.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{application.dob}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{application.gender.charAt(0).toUpperCase() + application.gender.slice(1)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Address Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{application.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{application.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="font-medium">{application.state}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ZIP Code</p>
                  <p className="font-medium">{application.zipCode}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b">Exam Information</h2>
            <div className="bg-indigo-50 p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Exam Name</p>
                  <p className="font-medium text-indigo-800">{application.examDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exam Date</p>
                  <p className="font-medium text-indigo-800">{application.examDetails.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exam Time</p>
                  <p className="font-medium text-indigo-800">{application.examDetails.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application Date</p>
                  <p className="font-medium text-indigo-800">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            {application.status === 'approved' ? (
              <button
                onClick={handleDownloadHallTicket}
                className="flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Hall Ticket
              </button>
            ) : (
              <div className="text-center p-4 bg-amber-50 rounded-md w-full">
                <Clock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <h3 className="font-medium text-amber-800 mb-1">Application is being processed</h3>
                <p className="text-sm text-amber-700">
                  Your application is currently under review. You will be able to download your hall ticket once it's approved.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Important Instructions</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Please bring a printed copy of your hall ticket to the examination center.</li>
          <li>Arrive at least 30 minutes before the scheduled exam time.</li>
          <li>Bring a valid photo ID (passport, driver's license, or college ID).</li>
          <li>Electronic devices are not permitted in the examination hall.</li>
          <li>Follow all COVID-19 safety protocols as per the examination center guidelines.</li>
        </ul>
      </div>
    </div>
  );
};

export default ApplicationStatus;