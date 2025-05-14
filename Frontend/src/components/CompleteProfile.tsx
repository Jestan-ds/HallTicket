import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfileForm from '../components/UserProfileForm';

const CompleteProfilePage: React.FC = () => {
  
  const navigate = useNavigate();

  

  return (
    
      <div className="max-w-3xl mx-auto py-8">
        <UserProfileForm />
      </div>
   
  );
};

export default CompleteProfilePage;