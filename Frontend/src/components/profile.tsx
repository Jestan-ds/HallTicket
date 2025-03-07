import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Save, CheckCircle } from 'lucide-react';

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

const Profile = () => {
  const [userData, setUserData] = useState(USER_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Simulate API call to fetch user data
    setTimeout(() => {
      setUserData(USER_DATA);
      setLoading(false);
    }, 800);
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
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
    
    // Reset saved state when form is modified
    if (saved) {
      setSaved(false);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.name.trim()) newErrors.name = 'Full name is required';
    if (!userData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userData.email)) newErrors.email = 'Email is invalid';
    if (!userData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!userData.address.trim()) newErrors.address = 'Address is required';
    if (!userData.city.trim()) newErrors.city = 'City is required';
    if (!userData.state.trim()) newErrors.state = 'State is required';
    if (!userData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSaving(true);
      
      // Simulate API call to update profile
      setTimeout(() => {
        // In a real app, this would send the updated data to a server
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setSaving(false);
        setSaved(true);
        
        // Reset saved notification after 3 seconds
        setTimeout(() => {
          setSaved(false);
        }, 3000);
      }, 1000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-600 text-2xl font-bold">
              {userData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold">{userData.name}</h2>
              <p className="text-indigo-200">{userData.email}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userData.name}
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
                    value={userData.email}
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
                    value={userData.phone}
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
                    value={userData.dob}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={userData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-indigo-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-700">Address Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={userData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={userData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={userData.state}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code*</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={userData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>}
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
              {saved && (
                <div className="mr-4 flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span>Profile saved successfully!</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded-md text-white font-medium flex items-center ${saving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;