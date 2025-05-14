// import React, {  useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Ticket, LogIn } from 'lucide-react';

// function Login({ setIsAuthenticated }: { setIsAuthenticated: (authenticated: boolean) => void }) {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       // Replace with your custom authentication API endpoint
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify(formData),
//       });
      

//       if(response.ok){
//         setIsAuthenticated(true);
//       }
//       else{
//         console.log("Login failed")
//       }

//       const data = await response.json();
       
//       if (!response.ok) {
//         throw new Error(data.message || 'Login failed');
//       }
//       localStorage.setItem('authToken', data.token); // Store the token in local storage or cookies
//       localStorage.setItem('user',JSON.stringify(data.user) ); // Store user ID if needed
      
//       navigate('/dashboard'); // Redirect to dashboard or home page after successful login
//       // Generate and send OTP
      
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred during login');
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   return (
    
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
//         <div className="text-center mb-8">
//           <div className="flex justify-center mb-4">
//             <Ticket className="h-12 w-12 text-indigo-600" />
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
//           <p className="text-gray-600 mt-2">Please sign in to your account</p>
//         </div>

//         {error && (
//           <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email Address
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Enter your email"
//               required
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={formData.password}
//               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//               className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Enter your password"
//               required
//             />
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="remember"
//                 className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//               />
//               <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
//                 Remember me
//               </label>
//             </div>
//             <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
//               Forgot password?
//             </a>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <LogIn className="h-5 w-5" />
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-600">
//           Don't have an account?{' '}
//           <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </div>
  
//   );
// }

// export default Login;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

// Remove the setIsAuthenticated prop from the component signature
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from your AuthContext

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Replace with your custom authentication API endpoint
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors (e.g., invalid credentials)
        throw new Error(data.message || 'Login failed');
      }

      // Assuming your API returns a token and user data including the role
      const { token, user } = data;

      // Call the login function from AuthContext
      // This function should update the context state with token and user info
      login(token, user);

      // Redirect based on the user's role received from the API
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/'); // Assuming '/dashboard' is the student landing page
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Removed the useEffect related to setIsAuthenticated from the previous App.tsx approach
  // If you had any logic here related to the old prop, it should be integrated
  // into the AuthContext's initial load/check logic instead.


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Ticket className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Please sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="h-5 w-5" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
