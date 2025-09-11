"use client";

import { useEffect, useState } from "react";
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ArrowLeft,
  Clock,
  AlertTriangle,
  Send,
  Loader2
} from "lucide-react";

export default function VerifyEmailPage() {
  const [mounted, setMounted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'success', 'expired', 'invalid', 'error'
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Get email and token from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email') || localStorage.getItem('pendingEmail') || 'user@example.com';
    const tokenParam = urlParams.get('token') || '';
    
    setUserEmail(emailParam);
    setToken(tokenParam);

    // Auto-verify if token is present in URL
    if (tokenParam) {
      handleAutoVerification(tokenParam);
    }
  }, []);

  // Auto verification from email link
  const handleAutoVerification = async (verifyToken) => {
    setIsVerifying(true);
    setVerificationStatus('pending');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate different responses based on token
      if (verifyToken === 'valid123') {
        setVerificationStatus('success');
      } else if (verifyToken === 'expired123') {
        setVerificationStatus('expired');
      } else if (verifyToken === 'invalid123') {
        setVerificationStatus('invalid');
      } else {
        // Random success/failure for demo
        const isSuccess = Math.random() > 0.3;
        setVerificationStatus(isSuccess ? 'success' : 'error');
        if (!isSuccess) {
          setErrorMessage('The verification link is invalid or has expired.');
        }
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Manual code verification
  const handleManualVerification = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check code (for demo purposes)
      if (code === '123456') {
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification code. Please try again.');
        // Clear the code
        setVerificationCode(['', '', '', '', '', '']);
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend verification email
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    setErrorMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start cooldown
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Show success message briefly
      setVerificationStatus('pending');
    } catch (error) {
      setErrorMessage('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle verification code input
  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single character
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="code-${index + 1}"]`);
      nextInput?.focus();
    }
    
    // Auto-verify when all fields are filled
    if (newCode.every(digit => digit !== '') && !isVerifying) {
      setTimeout(() => handleManualVerification(), 500);
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="code-${index - 1}"]`);
      prevInput?.focus();
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const goToLogin = () => {
    window.location.href = '/auth/login';
  };

  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const renderStatusContent = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your email has been successfully verified. You can now access all features of your account.
              </p>
              <button
                onClick={goToDashboard}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Link Expired</h2>
              <p className="text-lg text-gray-600 mb-6">
                The verification link has expired. Please request a new one to continue.
              </p>
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send New Link
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Invalid Link</h2>
              <p className="text-lg text-gray-600 mb-6">
                The verification link is invalid or malformed. Please try again with a new link.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Get New Link
                    </>
                  )}
                </button>
                <button
                  onClick={goBack}
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all duration-200 hover:shadow-md"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h2>
              <p className="text-lg text-gray-600 mb-2">
                We couldn't verify your email address.
              </p>
              {errorMessage && (
                <p className="text-red-600 mb-6">{errorMessage}</p>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setVerificationStatus('pending');
                    setErrorMessage('');
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-300 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                >
                  <Send className="w-5 h-5 mr-2" />
                  New Email
                </button>
              </div>
            </div>
          </div>
        );

      default: // pending
        return (
          <div className="space-y-8">
            {/* Automatic Verification Loading */}
            {isVerifying && token ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Verifying Email...</h2>
                  <p className="text-lg text-gray-600">
                    Please wait while we verify your email address.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Manual Verification */}
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-12 h-12 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Email</h2>
                    <p className="text-lg text-gray-600 mb-2">
                      We've sent a verification code to:
                    </p>
                    <p className="text-lg font-medium text-green-600 mb-6">{userEmail}</p>
                    <p className="text-gray-600">
                      Enter the 6-digit code below or click the link in your email.
                    </p>
                  </div>
                </div>

                {/* Verification Code Input */}
                <div className="space-y-6">
                  <div className="flex justify-center space-x-3">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        name={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200"
                        disabled={isVerifying}
                      />
                    ))}
                  </div>

                  {errorMessage && (
                    <div className="text-center">
                      <p className="text-red-600 text-sm">{errorMessage}</p>
                    </div>
                  )}

                  {isVerifying && !token && (
                    <div className="text-center">
                      <div className="inline-flex items-center text-green-600">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying code...
                      </div>
                    </div>
                  )}
                </div>

                {/* Resend Section */}
                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending || resendCooldown > 0}
                    className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-green-600 font-medium rounded-xl border border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <Clock className="w-5 h-5 mr-2" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Resend Code
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className={`max-w-md w-full transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStatusContent()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="/support" className="text-green-600 hover:text-green-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}