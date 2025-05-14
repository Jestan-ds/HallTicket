import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-10">
      <div className="flex-1"></div>
      
      <div className="flex items-center space-x-4">
        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
          <Bell size={20} />
        </button>
        
        <div className="flex items-center">
          <div className="mr-2 flex flex-col items-end">
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;