import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types'; // Assuming your User type is defined in types.ts

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void; // Added login function signature
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Create the context with an initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to easily access the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// The AuthProvider component that manages authentication state
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to check for stored user data on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    // You might also want to check for a token and validate it with your backend here
    // For simplicity, this example just checks for the user object
    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
         // Optional: Add a check here if the token/session is still valid
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user'); // Clear invalid data
      }
    }
    setIsLoading(false); // Set loading to false after initial check
  }, []); // Empty dependency array means this runs only once on mount

  // Function to handle user login
  const login = (token: string, userData: User) => {
    // Store user data and token (you might prefer cookies for token)
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', token); // Store token if needed elsewhere

    // Update the user state in the context
    setUser(userData);
  };

  // Function to handle user logout
  const logout = () => {
    // Remove stored user data and token
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');

    // Clear the user state in the context
    setUser(null);
  };

  // The value provided by the context
  const value = {
    user,
    isLoading,
    login, // Include the login function in the context value
    logout,
    isAuthenticated: !!user, // Derived state: true if user is not null
    isAdmin: user?.role === 'admin' // Derived state: true if user exists and role is 'admin'
  };

  // Provide the context value to the children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
