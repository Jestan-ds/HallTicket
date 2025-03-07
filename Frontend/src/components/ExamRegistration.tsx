import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, Info, Search, Filter, CheckCircle } from 'lucide-react';

// Available exams
const ALL_EXAMS = [
  { 
    id: 'math101', 
    name: 'Mathematics 101', 
    date: '2025-06-15', 
    time: '09:00 AM',
    duration: '3 hours',
    location: 'Main Campus, Building A',
    fee: '$50',
    registrationEndDate: '2025-06-01',
    category: 'Mathematics',
    description: 'Covers fundamental concepts in calculus, algebra, and geometry.',
    prerequisites: 'High school mathematics',
    seats: 120,
    availableSeats: 45
  },
  { 
    id: 'phys201', 
    name: 'Physics 201', 
    date: '2025-06-18', 
    time: '10:00 AM',
    duration: '3 hours',
    location: 'Science Building, Room 302',
    fee: '$60',
    registrationEndDate: '2025-06-05',
    category: 'Physics',
    description: 'Covers mechanics, thermodynamics, and basic electromagnetism.',
    prerequisites: 'Physics 101 or equivalent',
    seats: 80,
    availableSeats: 23
  },
  { 
    id: 'chem301', 
    name: 'Chemistry 301', 
    date: '2025-06-20', 
    time: '02:00 PM',
    duration: '3 hours',
    location: 'Science Building, Lab 201',
    fee: '$65',
    registrationEndDate: '2025-06-10',
    category: 'Chemistry',
    description: 'Advanced organic chemistry concepts and laboratory techniques.',
    prerequisites: 'Chemistry 201',
    seats: 60,
    availableSeats: 15
  },
  { 
    id: 'bio401', 
    name: 'Biology 401', 
    date: '2025-06-22', 
    time: '11:00 AM',
    duration: '3 hours',
    location: 'Life Sciences Building, Room 105',
    fee: '$70',
    registrationEndDate: '2025-06-12',
    category: 'Biology',
    description: 'Advanced topics in molecular biology and genetics.',
    prerequisites: 'Biology 301',
    seats: 50,
    availableSeats: 12
  },
  { 
    id: 'cs501', 
    name: 'Computer Science 501', 
    date: '2025-06-25', 
    time: '01:00 PM',
    duration: '4 hours',
    location: 'Technology Center, Lab 3',
    fee: '$80',
    registrationEndDate: '2025-06-15',
    category: 'Computer Science',
    description: 'Advanced algorithms, data structures, and system design.',
    prerequisites: 'Computer Science 401',
    seats: 40,
    availableSeats: 8
  },
  { 
    id: 'eng201', 
    name: 'English Literature 201', 
    date: '2025-06-28', 
    time: '10:00 AM',
    duration: '2 hours',
    location: 'Humanities Building, Room 204',
    fee: '$45',
    registrationEndDate: '2025-06-18',
    category: 'Humanities',
    description: 'Analysis of classic and contemporary literature.',
    prerequisites: 'English 101',
    seats: 100,
    availableSeats: 42
  },
  { 
    id: 'hist301', 
    name: 'History 301', 
    date: '2025-06-30', 
    time: '09:00 AM',
    duration: '3 hours',
    location: 'Humanities Building, Room 105',
    fee: '$55',
    registrationEndDate: '2025-06-20',
    category: 'Humanities',
    description: 'World history from 1900 to present.',
    prerequisites: 'History 201',
    seats: 90,
    availableSeats: 37
  }
];

// Mock user data
const USER_DATA = {
  id: 'user123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '555-123-4567',
  dob: '1995-05-15',
  gender: 'male',
  address: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  zipCode: '12345',
  profileCompleted: true
};

const ExamRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedExamId = queryParams.get('examId');
  
  const [exams, setExams] = useState(ALL_EXAMS);
  const [selectedExam, setSelectedExam] = useState<typeof ALL_EXAMS[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(USER_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  
  // Get unique categories for filter
  const categories = [...new Set(ALL_EXAMS.map(exam => exam.category))];
  
  useEffect(() => {
    // If an exam ID is provided in the URL, select that exam
    if (preselectedExamId) {
      const exam = ALL_EXAMS.find(e => e.id === preselectedExamId);
      if (exam) {
        setSelectedExam(exam);
        setStep(2);
      }
    }
    
    // Simulate API call to fetch exams
    setTimeout(() => {
      setExams(ALL_EXAMS);
    }, 500);
  }, [preselectedExamId]);
  
  // Filter exams based on search and filters
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    // ||     exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? exam.category === categoryFilter : true;
    const matchesDate = dateFilter ? exam.date === dateFilter : true;
    
    return matchesSearch && matchesCategory && matchesDate;
  });
  
  const handleExamSelect = (exam: typeof ALL_EXAMS[0]) => {
    setSelectedExam(exam);
    setStep(2);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExam) return;
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        // Generate a random application ID
        const applicationId = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Store application data in localStorage (in a real app, this would be sent to a server)
        localStorage.setItem(applicationId, JSON.stringify({
          ...formData,
          applicationId,
          examId: selectedExam.id,
          status: 'pending',
          appliedAt: new Date().toISOString(),
          examDetails: {
            id: selectedExam.id,
            name: selectedExam.name,
            date: selectedExam.date,
            time: selectedExam.time
          }
        }));
        
        setIsSubmitting(false);
        navigate(`/status/${applicationId}`);
      }, 1500);
    }
  };
  
  const resetSelection = () => {
    setSelectedExam(null);
    setStep(1);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Exam Registration</h1>
      
      {step === 1 && (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
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
              
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Exam List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-700">Available Exams</h2>
              <p className="text-gray-500 mt-1">Select an exam to register</p>
            </div>
            
            {filteredExams.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredExams.map(exam => (
                  <div key={exam.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-medium text-gray-900">{exam.name}</h3>
                        <p className="text-gray-600 mt-1">{exam.description}</p>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="inline-flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1 text-indigo-500" />
                            {exam.date}
                          </div>
                          <div className="inline-flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1 text-indigo-500" />
                            {exam.time} ({exam.duration})
                          </div>
                          <div className="inline-flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1 text-indigo-500" />
                            {exam.location}
                          </div>
                          <div className="inline-flex items-center text-sm text-gray-500">
                            <DollarSign className="h-4 w-4 mr-1 text-indigo-500" />
                            {exam.fee}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Registration closes: </span>
                          <span className="font-medium text-amber-600">{exam.registrationEndDate}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="text-center mb-3">
                          <div className="text-sm text-gray-500">Available Seats</div>
                          <div className="text-2xl font-bold text-indigo-600">{exam.availableSeats}/{exam.seats}</div>
                        </div>
                        
                        <button
                          onClick={() => handleExamSelect(exam)}
                          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        >
                          Select & Register
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No exams found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </>
      )}
      
      {step === 2 && selectedExam && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-indigo-600 p-6 text-white">
            <button
              onClick={resetSelection}
              className="mb-4 inline-flex items-center text-indigo-100 hover:text-white"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Exam List
            </button>
            
            <h2 className="text-2xl font-bold">{selectedExam.name}</h2>
            <p className="mt-1 text-indigo-100">{selectedExam.description}</p>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <div>
                  <div className="text-sm text-indigo-200">Date</div>
                  <div>{selectedExam.date}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <div>
                  <div className="text-sm text-indigo-200">Time</div>
                  <div>{selectedExam.time} ({selectedExam.duration})</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <div>
                  <div className="text-sm text-indigo-200">Location</div>
                  <div>{selectedExam.location}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Complete Registration</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>
                
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-md mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-indigo-800">Confirmation</h3>
                    <p className="text-sm text-indigo-700 mt-1">
                      By submitting this form, you confirm that all provided information is correct and you agree to the examination terms and conditions.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700">Registration Fee: </span>
                  <span className="text-lg font-bold text-indigo-600">{selectedExam.fee}</span>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-md text-white font-medium ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRegistration;