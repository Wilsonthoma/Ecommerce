import { useState, useEffect } from 'react';
import { testConnection } from '../services/api';

const ConnectionError = () => {
  const [showError, setShowError] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const handleNetworkError = (event) => {
      if (event.detail?.type === 'network') {
        setShowError(true);
      }
    };

    window.addEventListener('admin-network-error', handleNetworkError);
    
    return () => {
      window.removeEventListener('admin-network-error', handleNetworkError);
    };
  }, []);

  const handleRetry = async () => {
    setIsTesting(true);
    const connected = await testConnection();
    setIsTesting(false);
    
    if (connected) {
      setShowError(false);
      window.location.reload();
    }
  };

  const handleClose = () => {
    setShowError(false);
  };

  if (!showError) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Connection Error</h3>
            <p className="text-sm text-gray-600">Cannot connect to backend server</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            The admin panel cannot connect to the backend server. Please check:
          </p>
          
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
              Backend server is running on port <strong>5000</strong> (not 4000)
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
              No firewall is blocking the connection
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
              CORS is properly configured on backend
            </li>
          </ul>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            disabled={isTesting}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Testing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Retry Connection
              </>
            )}
          </button>
          
          <button
            onClick={handleClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionError;