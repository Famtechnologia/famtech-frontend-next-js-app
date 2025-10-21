'use client';

import React, { useState, useEffect } from "react";
import { FaPaperPlane} from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation"; 
// Note: You would import your resend API function here
// import { resendVerificationEmail } from "@/lib/api/auth";

export default function VerifyEmailNoticePage() {
    const router = useRouter();
    const [, setUserEmail] = useState('');
   // const [, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isLoggingIn, setIsLoggingIn] = useState(false); // 👈 New state for Login button

    // --- Load Email from Storage ---
    useEffect(() => {
        const email = localStorage.getItem("pendingVerificationEmail");
        if (email) {
            setUserEmail(email);
        }
    }, []);

    // --- Cooldown Timer Logic ---
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [resendCooldown]);

    // --- Resend Handler ---
  {/* const handleResendEmail = async () => {
        if (isResending || resendCooldown > 0 || !userEmail) return;
     setIsResending(true);

        try {
            // 🚀 REAL API CALL: await resendVerificationEmail({ email: userEmail });
            
            // Simulation to show the spinner (Remove in production)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setResendCooldown(60); 
            alert(`New verification email sent to ${userEmail}!`);

        } catch (error) {
            console.error("Resend error:", error);
            alert("Failed to resend verification email. Please try again later.");
        } finally {
            setIsResending(false);
        }
    };*/}

    // --- Go to Login Handler with Loading State ---
    const handleGoToLogin = () => {
        setIsLoggingIn(true);
        
        // Use a short delay to ensure the user sees the spinner before navigation
        setTimeout(() => {
            router.push("/login");
            
            // Clean up the temporary email storage after sending the user to login
            localStorage.removeItem("pendingVerificationEmail"); 
        }, 500); 
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl text-center">
                
                <FaPaperPlane className="text-green-600 text-6xl mx-auto mb-6" />

                <h2 className="text-3xl font-bold mb-4 text-gray-800">
                    Verify Your Email Address
                </h2>
                
                <p className="text-gray-600 mb-6">
                    Thank you for signing up! We&#39;ve sent a verification to your email address. 
                    <br/>
                  
                </p>
                
                <hr className="my-6 text-gray-300" />

                <p className="text-sm text-gray-500 mb-4">
                    Didn&#39;t receive the email? Check your spam or junk folder.
                </p>

                
                    {/* Resend Button with Loading/Cooldown States 
                    <button
                        onClick={handleResendEmail}
                        disabled={isResending || resendCooldown > 0 || !userEmail}
                        className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-300 transition duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : resendCooldown > 0 ? (
                            <span>Resend in {resendCooldown}s</span>
                        ) : (
                            <>
                                <FaRedo />
                                <span>Resend Verification Email</span>
                            </>
                        )}
                    </button> */}

                    {/* Go to Login Button with Loading State */}
                    <button
                        onClick={handleGoToLogin}
                        disabled={isLoggingIn}
                        className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition duration-150 disabled:bg-green-400 disabled:cursor-wait inline-flex items-center justify-center gap-2"
                    >
                        {isLoggingIn ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Going to Login...</span>
                            </>
                        ) : (
                            <span>Go to Login Page</span>
                        )}
                    </button>
                </div>
            </div>
    
    );
}