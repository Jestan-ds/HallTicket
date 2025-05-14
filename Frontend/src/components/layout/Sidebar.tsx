import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  ClipboardList,
  QrCode,
  LogOut,
  Settings,
  Bell // Import the Bell icon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Adjust the path as needed

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout, isAdmin } = useAuth();

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Exams', path: '/admin/exams', icon: <FileText size={20} /> },
    { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
    { name: 'Registrations', path: '/admin/registrations', icon: <ClipboardList size={20} /> },
    // Changed the 'Settings' link to 'Notification History'
    { name: 'Notification History', path: '/admin/notifications/sent', icon: <Bell size={20} /> }, // Updated path and icon
  ];

  // Assuming isAdmin correctly determines if the user is an admin
  const navItems = isAdmin ? adminNavItems : [];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-xl font-bold">Exam Portal</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center px-4 py-2 rounded-md transition-colors
                  ${location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin') // Added startsWith check for nested routes, but exclude exact match for /admin to avoid highlighting everything
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                `}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
