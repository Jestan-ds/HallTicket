import  { useState, useEffect, useRef } from 'react';
import {  Route, Routes, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
// import FileUpload from './components/FileUpload';
// import {StudentSearch} from './components/StudentSearch';
// import {HallTicket} from './components/HallTicket';
// import { Printer } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ApplicationStatus from './components/ApplicationStatus';
import Navbar from './components/Navbar';
import ExamRegistration from './components/ExamRegistration';
import RegisteredExams from './components/RegisteredExams';
import Profile from './components/Profile';
import Login from './components/Login';
import Signup from './components/Signup';
import OTPVerification from './components/OTPVerification';
import { Navigate } from 'react-router-dom';


function HallTicketPage() {
  const { studentId } = useParams(); // Get studentId from URL params
  const [student, setStudent] = useState(null);

  useEffect(() => {
    // Retrieve students from localStorage
    // const students = JSON.parse(localStorage.getItem('students')) || [];
    // const foundStudent = students.find((s) => s.studentId.toString() === studentId);
    // setStudent(foundStudent);
    
     const response =  fetch("http://localhost:5000/api/students")
        .then((res) => res.json())
       const foundStudent = response.find((s) => s.studentId.toString() === studentId);
      setStudent(foundStudent);
    
  }, [studentId]);

  return student ? <HallTicket student={student} /> : <p style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>Student not found</p>;
}

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const contentRef = useRef(null);

  // Load students from localStorage when the app starts
  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  const handlePrint = useReactToPrint({
    contentRef
    })
    
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
    {/* <Router> */}
      
      <div className="container mx-auto px-4 py-8">
      <Routes>
        {/* Home route where students are uploaded and selected */}
        {/* <Route path="/" element={
          <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-center">
                <h1 className="text-3xl font-bold mb-8" style={{ textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Hall Ticket Generator
                </h1>
              </div>
              <FileUpload onDataUpload={setStudents} />
              {students.length > 0 && (
                <StudentSearch students={students} onStudentSelect={setSelectedStudent} />
              )}
              {selectedStudent && (
                <div className="mt-8">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={()=>{
                        console.log("Printing started...");
                        handlePrint();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Printer className="w-5 h-5" />
                      Print Hall Ticket
                    </button>
                  </div>
                  <div ref={contentRef}>
                    <HallTicket student={selectedStudent} />
                  </div>
                </div>
              )}
            </div>
          </div>
        } /> */}
          <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
          {/* <Route path="/" element={<Dashboard />} /> */}
          <Route path="/register-exam" element={<ExamRegistration />} />
          <Route path="/my-exams" element={<RegisteredExams />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/status/:applicationId" element={<ApplicationStatus />} />

        {/* HallTicketPage route with dynamic studentId */}
        <Route path="/hallticket/:studentId" element={<HallTicketPage />} />
      </Routes>
      </div>
    {/* </Router> */}
    </div>
  );
}

export default App;
