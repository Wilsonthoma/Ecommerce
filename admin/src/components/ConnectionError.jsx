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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-gray-800 border border-gray-700 shadow-2xl rounded-xl animate-fadeInUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-500/20">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Connection Error</h3>
            <p className="text-sm text-gray-400">Cannot connect to backend server</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="mb-3 text-gray-300">
            The admin panel cannot connect to the backend server. Please check:
          </p>
          
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
              Backend server is running on port <strong className="text-yellow-500">5000</strong> (not 4000)
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
              No firewall is blocking the connection
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
              CORS is properly configured on backend
            </li>
          </ul>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            disabled={isTesting}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2.5 rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isTesting ? (
              <>
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                Testing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Retry Connection
              </>
            )}
          </button>
          
          <button
            onClick={handleClose}
            className="px-4 py-2.5 border border-gray-600 rounded-lg hover:bg-gray-700 text-gray-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionError;