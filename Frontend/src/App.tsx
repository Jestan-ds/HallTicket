// import  { useState, useEffect } from 'react';
// import {  Route, Routes } from 'react-router-dom';
// // import { useReactToPrint } from 'react-to-print';
// // import FileUpload from './components/FileUpload';
// // import {StudentSearch} from './components/StudentSearch';
// // import {HallTicket} from './components/HallTicket';
// // import { Printer } from 'lucide-react';
// //import Dashboard from './components/Dashboard';
// import Dashboard1 from './components/Dashboard1';
// //import ApplicationStatus from './components/ApplicationStatus';
// import Navbar from './components/Navbar';
// //import ExamRegistration from './components/ExamRegistration';
// import ExamRegistration1 from './components/ExamRegistration1';
// import RegisteredExams from './components/RegisteredExams';
// import Profile from './components/Profile';
// import Login from './components/Login';
// import Signup from './components/Signup';
// import OTPVerification from './components/OTPVerification';
// import { Navigate } from 'react-router-dom';
// import ProtectedRoute from './components/ProtectedRoute';
// import CompleteProfilePage from './components/CompleteProfile';
// import ExamDetailsPage from './components/ExamDetails';




// function App() {
//   // const [students, setStudents] = useState([]);
//   // const [selectedStudent, setSelectedStudent] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {isAuthenticated && <Navbar />}
      
//       <div className="container mx-auto px-4 py-8">
//       <Routes>
//           <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated}/>} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/verify-otp" element={<OTPVerification />} />
//         <Route path="/complete-profile" element={<CompleteProfilePage />} />
//         <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
//         {/* Protected routes */}
//           <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard1 /></ProtectedRoute>} /> 
//           <Route path="/register-exam" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ExamRegistration1 /></ProtectedRoute>} />
//           <Route path="/my-exams" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RegisteredExams /></ProtectedRoute>} />
//           <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile /></ProtectedRoute>} />
//           <Route path="/status/:applicationId" element={<ExamDetailsPage/>} />
//       </Routes>
//       </div>
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Assuming you have an AuthContext

// Import Layout for Admin
// NOTE: Your actual AdminLayout component file (e.g., ./components/layout/Layout.tsx)
// MUST be defined to accept and render 'children'.
// Example: const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => { ... return <div>{children}</div>; };
import AdminLayout from './components/layout/Layout'; // Assuming your Layout component is for Admin

// Import Navbar for Students
import StudentNavbar from './components/Navbar'; // Assuming your Navbar component is here

// Import all necessary components for both roles
// Student Components
import StudentDashboard from './components/Dashboard1';
import ExamRegistration1 from './components/ExamRegistration1';
import RegisteredExams from './components/RegisteredExams';
import Profile from './components/Profile';
import ExamDetailsPage from './components/ExamDetails';

// Admin Components
import AdminDashboard from './pages/AdminDashboard';
import ExamList from './pages/ExamList';
import CreateExamForm from './pages/CreateExamForm';
import EditExamForm from './pages/EditExamForm';
import StudentList from './pages/StudentList';
import RegistrationList from './pages/RegistrationList';
//import QRVerification from './pages/QrVerification';

// Authentication Components (assuming these are not role-specific)
import LoginPage from './components/Login';
import Signup from './components/Signup';
import OTPVerification from './components/OTPVerification';
import CompleteProfilePage from './components/CompleteProfile';
import UploadStudentsPage from './pages/UploadStudentsPage';
import NotificationHistory from './components/NotificationHistory';


// Protected route component - checks authentication and role
// This component will now wrap the Route definition itself
const ProtectedRoute: React.FC<{
  children: React.ReactNode; // Use children to wrap the Route
  requiredRole?: 'admin' | 'student';
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const redirectPath = user?.role === 'admin' ? '/admin' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and role matches, render the wrapped Route
  return <>{children}</>;
};

// A simple layout component for students including the Navbar
// This component will render the Navbar and the Outlet for nested student routes
interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // ...
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <StudentNavbar />}
      <div className="container mx-auto px-4 py-8">
        {children} {/* Render nested student routes here */}
      </div>
    </div>
  );
};

// Component to define routes based on user role
function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  // Determine the initial redirect path based on authentication and role
  const initialRedirect = isAuthenticated
    ? (user?.role === 'admin' ? '/admin' : '/')
    : '/login';

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />

      {/* Default route redirects based on auth/role */}
      <Route path="/" element={<Navigate to={initialRedirect} replace />} />

      {/* Protected Admin Routes - Wrapped by ProtectedRoute, using AdminLayout as the element */}
      {/* The path="/admin/*" allows for nested routes under /admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            {/* AdminLayout is the element for this parent route */}
            {/* It receives <Outlet /> as children and must render it */}
            <AdminLayout>
              <Outlet /> {/* AdminLayout must render Outlet for nested routes */}
            </AdminLayout>
          </ProtectedRoute>
        }
      >
        {/* Nested Admin Routes - These will render inside AdminLayout's Outlet */}
        <Route index element={<AdminDashboard />} /> {/* Default route for /admin */}
        <Route path="exams" element={<ExamList />} />
        <Route path="exams/create" element={<CreateExamForm />} />
        <Route path="exams/edit/:id" element={<EditExamForm />} />
        <Route path="students" element={<UploadStudentsPage/>} />
        <Route path="registrations" element={<RegistrationList />} />
        {/* <Route path="verify" element={<QRVerification />} /> */}
        {/* Admin catch-all for paths starting with /admin/ */}
        <Route path="notifications/sent" element={<NotificationHistory/>}/>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Protected Student Routes - Wrapped by ProtectedRoute, using StudentLayout as the element */}
       {/* The path="/dashboard/*" allows for nested routes under /dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout> {/* StudentLayout is the element for this parent route */}
              <Outlet /> {/* StudentLayout must render Outlet for nested routes */}
            </StudentLayout>
          </ProtectedRoute>
        }
      >
        {/* Nested Student Routes - These will render inside StudentLayout's Outlet */}
        <Route index element={<StudentDashboard />} /> {/* Default route for /dashboard */}
        <Route path="register-exam" element={<ExamRegistration1 />} />
        <Route path="my-exams" element={<RegisteredExams />} />
        <Route path="profile" element={<Profile />} />
        <Route path="status/:applicationId" element={<ExamDetailsPage />} />
         {/* Student catch-all for paths starting with /dashboard/ */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback route for any other case (e.g., trying to access a protected route without being logged in) */}
      {/* This will redirect to the login page if the user is not authenticated */}
      {/* If authenticated but no role matches, this might also redirect to login */}
       

    </Routes>
  );
}

// Main App component wrapping everything with AuthProvider and Router
function App() {
  return (
    <AuthProvider> {/* Provides authentication state and user info */}
      
        {/* Layout is now handled within AppRoutes based on role */}
        <AppRoutes /> {/* Renders the role-specific routes and their layouts */}
      
    </AuthProvider>
  );
}

export default App;
