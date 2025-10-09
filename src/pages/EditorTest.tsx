import React from 'react';
import { useNavigate } from 'react-router-dom';

const EditorTest = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Editor Test Page</h1>
      <p className="mt-4">This is a test page to check if routing to /editor works.</p>
      <button 
        onClick={() => navigate('/')}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Back to Home
      </button>
    </div>
  );
};

export default EditorTest;
