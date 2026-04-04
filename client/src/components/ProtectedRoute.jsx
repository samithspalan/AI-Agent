import React from 'react';
import { useAuth, SignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  // Still loading Clerk session
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050A14]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-emerald-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-l-2 border-r-2 border-blue-500 animate-[spin_1.5s_linear_infinite_reverse]" />
        </div>
      </div>
    );
  }

  // Not signed in → send back to landing
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
