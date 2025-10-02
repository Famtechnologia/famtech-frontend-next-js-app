"use client";

import { useEffect, useState } from "react";
import { 
  Shield, 
  ArrowLeft, 
  Home,
  Lock,
  User,
  AlertTriangle,
  RefreshCw,
  LogIn,
  Eye,
  EyeOff
} from "lucide-react";

export default function UnauthorizedPage() {
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [requiredRole, setRequiredRole] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get context from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const currentRole = urlParams.get('role') || localStorage.getItem('userRole') || '';
    const neededRole = urlParams.get('required') || localStorage.getItem('requiredRole') || 'admin';
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true' || !!currentRole;
    
    setUserRole(currentRole);
    setRequiredRole(neededRole);
    setIsLoggedIn(loggedIn);

    console.log("Unauthorized access attempt:", { currentRole, neededRole, loggedIn });
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleLogin = () => {
    // Store the current URL to redirect after login
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = '/login';
  };

  const handleContactAdmin = () => {
    window.location.href = '/contact?reason=access-request';
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'manager': 'Farm Manager',
      'farmer': 'Farmer',
      'worker': 'Farm Worker',
      'viewer': 'Viewer'
    };
    return roleMap[role] || role;
  };

  const getAccessLevelMessage = () => {
    if (!isLoggedIn) {
      return {
        title: "Authentication Required",
        message: "You need to log in to access this area of the application.",
        icon: <LogIn className="w-12 h-12 text-red-600" />,
        color: "red"
      };
    } else if (!userRole) {
      return {
        title: "Role Not Assigned",
        message: "Your account doesn't have a role assigned. Please contact an administrator.",
        icon: <User className="w-12 h-12 text-yellow-600" />,
        color: "yellow"
      };
    } else {
      return {
        title: "Insufficient Permissions",
        message: `Your current role (${getRoleDisplayName(userRole)}) doesn't have permission to access this resource.`,
        icon: <Shield className="w-12 h-12 text-red-600" />,
        color: "red"
      };
    }
  };

  const accessInfo = getAccessLevelMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className={`max-w-2xl w-full transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 bg-${accessInfo.color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
              {accessInfo.icon}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {accessInfo.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {accessInfo.message}
              </p>
            </div>
          </div>

          {/* Access Level Information */}
          {isLoggedIn && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-gray-600" />
                Access Level Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Your Current Role</p>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${userRole ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="font-medium text-gray-900">
                      {userRole ? getRoleDisplayName(userRole) : 'No Role Assigned'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Required Role</p>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <span className="font-medium text-gray-900">
                      {getRoleDisplayName(requiredRole)}
                    </span>
                  </div>
                </div>
              </div>

              {userRole && requiredRole && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        <strong>Permission Mismatch:</strong> You need {getRoleDisplayName(requiredRole)} 
                        privileges or higher to access this resource.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {!isLoggedIn ? (
              // Not logged in - show login button
              (<>
                <button
                  onClick={handleLogin}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Continue
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={handleGoBack}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all duration-200 hover:shadow-md"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Go Back
                  </button>
                  
                  <button
                    onClick={handleGoHome}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all duration-200 hover:shadow-md"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Home
                  </button>
                </div>
              </>)
            ) : (
              // Logged in but insufficient permissions
              (<>
                <button
                  onClick={handleContactAdmin}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  <User className="w-5 h-5 mr-2" />
                  Request Access Upgrade
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={handleGoBack}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all duration-200 hover:shadow-md"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Go Back
                  </button>
                  
                  <button
                    onClick={handleGoHome}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all duration-200 hover:shadow-md"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Dashboard
                  </button>
                </div>
              </>)
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Need Help?
            </h3>
            
            <div className="space-y-3 text-sm text-green-800">
              {!isLoggedIn ? (
                <>
                  <p>• Make sure you have an active account and are signed in</p>
                  <p>• Check that you're using the correct login credentials</p>
                  <p>• Clear your browser cache if you're having login issues</p>
                </>
              ) : (
                <>
                  <p>• Contact your administrator to request role upgrades</p>
                  <p>• Verify you're accessing the correct resource for your role</p>
                  <p>• Check if your account permissions have recently changed</p>
                </>
              )}
              <p>• Contact support if you believe this is an error</p>
            </div>

            <div className="mt-4 pt-4 border-t border-green-300">
              <p className="text-sm text-green-700">
                <strong>Support:</strong>{' '}
                <a href="/support" className="text-green-600 hover:text-green-800 underline">
                  Contact our help desk
                </a>
                {' '}or email{' '}
                <a href="mailto:support@farmapp.com" className="text-green-600 hover:text-green-800 underline">
                  support@farmapp.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            If you believe you should have access to this resource, please contact your administrator.
          </p>
        </div>

        {/* Debug Info */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p><strong>Debug Info:</strong></p>
            <p>User Role: {userRole || 'None'}</p>
            <p>Required Role: {requiredRole}</p>
            <p>Is Logged In: {isLoggedIn ? 'Yes' : 'No'}</p>
            <p>URL: {window.location.pathname}</p>
          </div>
        )} */}
      </div>
    </div>
  );
}