import React from 'react';
import { useAuth } from '../hooks/useAuth';

const TestAuth: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-8">Loading authentication status...</div>;
  }

  return (
    <div className="p-6 bg-slate-800 rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Authentication Test</h2>
      <div className="space-y-4">
        <div>
          <p className="font-medium">Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <p className="font-medium">User ID: {user?.id || 'Not logged in'}</p>
        </div>
        <div>
          <p className="font-medium">User Email: {user?.email || 'Not available'}</p>
        </div>
        <div>
          <p className="font-medium">User Role: {user?.role || 'Not available'}</p>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;