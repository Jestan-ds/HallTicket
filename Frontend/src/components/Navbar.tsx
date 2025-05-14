// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Ticket, Home, BookOpen, User, Menu, X } from 'lucide-react';

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const location = useLocation();

//   const isActive = (path: string) => {
//     return location.pathname === path ? 'bg-indigo-700' : 'hover:bg-indigo-700';
//   };

//   return (
//     <nav className="bg-indigo-600 text-white shadow-md">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           <Link to="/" className="flex items-center space-x-2">
//             <Ticket className="h-6 w-6" />
//             <span className="font-bold text-xl">HallTicket Portal</span>
//           </Link>
          
//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button 
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="text-white focus:outline-none"
//             >
//               {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//             </button>
//           </div>
          
//           {/* Desktop menu */}
//           <div className="hidden md:flex space-x-4">
//             <Link to="/dashboard" className={`flex items-center px-3 py-2 rounded ${isActive('/')}`}>
//               <Home className="h-5 w-5 mr-1" />
//               <span>Dashboard</span>
//             </Link>
//             <Link to="/dashboard/register-exam" className={`flex items-center px-3 py-2 rounded ${isActive('/register-exam')}`}>
//               <BookOpen className="h-5 w-5 mr-1" />
//               <span>Register Exam</span>
//             </Link>
//             <Link to="/dashboard/my-exams" className={`flex items-center px-3 py-2 rounded ${isActive('/my-exams')}`}>
//               <Ticket className="h-5 w-5 mr-1" />
//               <span>My Exams</span>
//             </Link>
//             <Link to="/dashboard/profile" className={`flex items-center px-3 py-2 rounded ${isActive('/profile')}`}>
//               <User className="h-5 w-5 mr-1" />
//               <span>Profile</span>
//             </Link>
            
//           </div>
//         </div>
        
//         {/* Mobile menu */}
//         {isMenuOpen && (
//           <div className="md:hidden py-3 border-t border-indigo-500">
//             <Link 
//               to="/" 
//               className={`block px-3 py-2 rounded ${isActive('/')}`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               <div className="flex items-center">
//                 <Home className="h-5 w-5 mr-2" />
//                 <span>Dashboard</span>
//               </div>
//             </Link>
//             <Link 
//               to="/register-exam" 
//               className={`block px-3 py-2 rounded ${isActive('/register-exam')}`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               <div className="flex items-center">
//                 <BookOpen className="h-5 w-5 mr-2" />
//                 <span>Register Exam</span>
//               </div>
//             </Link>
//             <Link 
//               to="/my-exams" 
//               className={`block px-3 py-2 rounded ${isActive('/my-exams')}`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               <div className="flex items-center">
//                 <Ticket className="h-5 w-5 mr-2" />
//                 <span>My Exams</span>
//               </div>
//             </Link>
//             <Link 
//               to="/profile" 
//               className={`block px-3 py-2 rounded ${isActive('/profile')}`}
//               onClick={() => setIsMenuOpen(false)}
//             >
//               <div className="flex items-center">
//                 <User className="h-5 w-5 mr-2" />
//                 <span>Profile</span>
//               </div>
//             </Link>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Import LogOut icon and useAuth hook
import { Ticket, Home, BookOpen, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Adjust the path as needed

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  // Use the useAuth hook to get logout function and authentication status
  const { logout, isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    // Adjust isActive logic slightly to handle nested routes if needed,
    // but for exact path matching, your current logic is fine.
    // For example, to highlight '/dashboard' when on '/dashboard/register-exam':
    // return location.pathname.startsWith(path) ? 'bg-indigo-700' : 'hover:bg-indigo-700';
    return location.pathname === path ? 'bg-indigo-700' : 'hover:bg-indigo-700';
  };

  // Function to handle logout and close mobile menu
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    setIsMenuOpen(false); // Close the mobile menu after logging out
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Link to the student dashboard */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6" />
            <span className="font-bold text-xl">HallTicket Portal</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu" // Added for accessibility
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dashboard Link */}
            <Link to="/" className={`flex items-center px-3 py-2 rounded ${isActive('/')}`}>
              <Home className="h-5 w-5 mr-1" />
              <span>Dashboard</span>
            </Link>
            {/* Register Exam Link */}
            <Link to="/register-exam" className={`flex items-center px-3 py-2 rounded ${isActive('/register-exam')}`}>
              <BookOpen className="h-5 w-5 mr-1" />
              <span>Register Exam</span>
            </Link>
            {/* My Exams Link */}
            <Link to="/my-exams" className={`flex items-center px-3 py-2 rounded ${isActive('/my-exams')}`}>
              <Ticket className="h-5 w-5 mr-1" />
              <span>My Exams</span>
            </Link>
            {/* Profile Link */}
            <Link to="/profile" className={`flex items-center px-3 py-2 rounded ${isActive('/profile')}`}>
              <User className="h-5 w-5 mr-1" />
              <span>Profile</span>
            </Link>

            {/* Logout Button for Desktop - Only show if authenticated */}
            {isAuthenticated && (
              <button
                onClick={handleLogout} // Use the handleLogout function
                className="flex items-center px-3 py-2 rounded hover:bg-indigo-700 text-white"
              >
                <LogOut size={20} className="mr-1" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {/* Conditionally render the mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-indigo-500">
            {/* Dashboard Link */}
            <Link
              to="/"
              className={`block px-3 py-2 rounded ${isActive('/dashboard')}`}
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                <span>Dashboard</span>
              </div>
            </Link>
            {/* Register Exam Link */}
            <Link
              to="/register-exam"
              className={`block px-3 py-2 rounded ${isActive('/dashboard/register-exam')}`}
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                <span>Register Exam</span>
              </div>
            </Link>
            {/* My Exams Link */}
            <Link
              to="/my-exams"
              className={`block px-3 py-2 rounded ${isActive('/dashboard/my-exams')}`}
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              <div className="flex items-center">
                <Ticket className="h-5 w-5 mr-2" />
                <span>My Exams</span>
              </div>
            </Link>
            {/* Profile Link */}
            <Link
              to="/profile"
              className={`block px-3 py-2 rounded ${isActive('/dashboard/profile')}`}
              onClick={() => setIsMenuOpen(false)} // Close menu on click
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>Profile</span>
              </div>
            </Link>

            {/* Logout Button for Mobile - Only show if authenticated */}
            {isAuthenticated && (
              <button
                onClick={handleLogout} // Use the handleLogout function
                className="block w-full text-left px-3 py-2 rounded hover:bg-indigo-700 text-white mt-2"
              >
                 <div className="flex items-center">
                  <LogOut size={20} className="mr-2" />
                  <span>Logout</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
