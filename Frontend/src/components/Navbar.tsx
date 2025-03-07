import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ticket, Home, BookOpen, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-indigo-700' : 'hover:bg-indigo-700';
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6" />
            <span className="font-bold text-xl">HallTicket Portal</span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex space-x-4">
            <Link to="/" className={`flex items-center px-3 py-2 rounded ${isActive('/')}`}>
              <Home className="h-5 w-5 mr-1" />
              <span>Dashboard</span>
            </Link>
            <Link to="/register-exam" className={`flex items-center px-3 py-2 rounded ${isActive('/register-exam')}`}>
              <BookOpen className="h-5 w-5 mr-1" />
              <span>Register Exam</span>
            </Link>
            <Link to="/my-exams" className={`flex items-center px-3 py-2 rounded ${isActive('/my-exams')}`}>
              <Ticket className="h-5 w-5 mr-1" />
              <span>My Exams</span>
            </Link>
            <Link to="/profile" className={`flex items-center px-3 py-2 rounded ${isActive('/profile')}`}>
              <User className="h-5 w-5 mr-1" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-indigo-500">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded ${isActive('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link 
              to="/register-exam" 
              className={`block px-3 py-2 rounded ${isActive('/register-exam')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                <span>Register Exam</span>
              </div>
            </Link>
            <Link 
              to="/my-exams" 
              className={`block px-3 py-2 rounded ${isActive('/my-exams')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <Ticket className="h-5 w-5 mr-2" />
                <span>My Exams</span>
              </div>
            </Link>
            <Link 
              to="/profile" 
              className={`block px-3 py-2 rounded ${isActive('/profile')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>Profile</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;