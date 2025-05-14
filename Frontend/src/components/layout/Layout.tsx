import React, { ReactNode } from 'react';
import Sidebar from './Sidebar'; // Assuming this is your admin sidebar
import Header from './Header'; // Assuming this is your admin header
// Removed: import { useAuth } from '../../context/AuthContext'; // No longer needed here

interface LayoutProps {
  children: ReactNode;
}

// Renamed for clarity based on its usage as AdminLayout
const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  // Removed: const { isAuthenticated } = useAuth(); // No longer needed here

  // Removed: Conditional check for isAuthenticated
  // if (!isAuthenticated) {
  //   return <>{children}</>;
  // }

  // The layout structure for authenticated admin users
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Assuming Sidebar is part of the admin layout */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Assuming Header is part of the admin layout */}
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          {/* This is where the nested admin routes will render */}
          {children}
          {/* Alternatively, if your layout doesn't need to process children before rendering, you could use <Outlet /> directly */}
          {/* <Outlet /> */}
        </main>
      </div>
    </div>
  );
};

// Export as default, but you might want to rename the import in App.tsx
// to match AdminLayout if you rename the file itself.
export default AdminLayout;
