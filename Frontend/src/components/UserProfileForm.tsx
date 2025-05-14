import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Calendar, MapPin } from 'lucide-react';
import Input from '../UI/Input';
import Button from '../UI/Button';



const UserProfileForm: React.FC = () => {
 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone:  '',
    dob:  '',
    gender: '',
    address: '',
    city:  '',
    state:  '',
    zipCode:  '',
    email:  ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^\d{10}$/;
    const zipRegex = /^\d{5,10}$/;
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.gender) {
        newErrors.gender = 'Gender is required';
      }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setIsLoading(true);
    setError(null);
    
    try {
        const response = await fetch('http://localhost:5000/api/userDetails/create',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        })
      const data = await response.json();
      console.log(data);
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save profile');
        }
      navigate('/login');
    } catch (err) {
      console.error('Profile save failed:', err);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Complete Your Profile</h2>
        <p className="text-center text-gray-600 mb-8">
          Please provide your personal details to complete your registration.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <User size={18} />
              </div>
              <Input
                id="name"
                name="name"
                type="text"
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                className="pl-10"
                autoComplete="name"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Phone size={18} />
              </div>
              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="1234567890"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                className="pl-10"
                autoComplete="tel"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Calendar size={18} />
              </div>
              <Input
                id="dob"
                name="dob"
                type="date"
                label="Date of Birth"
                value={formData.dob}
                onChange={handleChange}
                error={errors.dob}
                className="pl-10"
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
            
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <MapPin size={18} />
              </div>
              <Input
                id="address"
                name="address"
                type="text"
                label="Address"
                placeholder="123 Main St"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                className="pl-10"
                autoComplete="street-address"
              />
            </div>
            
            <div>
              <Input
                id="city"
                name="city"
                type="text"
                label="City"
                placeholder="New York"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                autoComplete="address-level2"
              />
            </div>
            
            <div>
              <Input
                id="state"
                name="state"
                type="text"
                label="State"
                placeholder="NY"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                autoComplete="address-level1"
              />
            </div>
            
            <div>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                label="ZIP Code"
                placeholder="10001"
                value={formData.zipCode}
                onChange={handleChange}
                error={errors.zipCode}
                autoComplete="postal-code"
              />
            </div>
            
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                
              />
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              size="lg"
            >
              Complete Registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileForm;