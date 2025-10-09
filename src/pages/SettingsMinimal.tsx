import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Settings = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Settings (Minimal)</h1>
      <p className="mt-4">This is a simplified version to test if the component loads.</p>
      <Button 
        onClick={() => navigate('/')} 
        className="mt-4"
      >
        Back to Home
      </Button>
    </div>
  );
};

export default Settings;
