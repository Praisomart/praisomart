import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, RefreshCw, Mail, Phone, Lock } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Retrieve the email/phone number passed from the previous registration/signin page
  const target = location.state?.target || localStorage.getItem("otp_target") || "";
  const isPhone = /^[0-9+]+$/.test(target);
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Save the target to localStorage as a fallback in case of page refresh
  useEffect(() => {
    if (target) {
      localStorage.setItem("otp_target", target);
    }
  }, [target]);

  // Handle OTP Submission
  const handleVerify = async (otpValue: string) => {
    if (otpValue.length !== 6) return;
    setIsLoading(true);
    
    try {
      // Plug-and-play endpoint for OTP verification
      const data = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          identifier: target,
          otp: otpValue,
        }),
      });

      toast.success("Verification successful!");
      
      // Clear OTP temporary storage
      localStorage.removeItem("otp_target");

      // Log the user in if a JWT is returned, else redirect to signin
      if (data.jwtToken) {
        login(data.jwtToken, {
          identifier: data.email || target,
          name: data.name || "User",
          email: data.email || target,
          role: data.role || "USER",
        });
        navigate("/");
      } else {
        toast.info("Account verified. Please sign in to continue.");
        navigate("/signin");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP Request
  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    
    try {
      // Plug-and-play endpoint for resending OTP
      await apiFetch("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ identifier: target }),
      });
      
      toast.success("A new 6-digit verification code has been sent!");
      setCountdown(60); // Reset countdown to 60 seconds
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  // Keep it robust in case someone accesses the page directly without target
  if (!target) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm space-y-4">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
              <Lock size={30} />
            </div>
            <h1 className="text-2xl font-bold font-display">Access Denied</h1>
            <p className="text-muted-foreground text-sm">
              No active email or phone registration session found. Please sign up first.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all text-sm shadow-md">
              <ArrowLeft size={16} /> Back to Sign Up
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-card border rounded-[2.5rem] shadow-xl p-8 md:p-12 relative overflow-hidden">
            {/* Background Accent Gradients */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />

            <div className="flex flex-col items-center text-center mb-8 relative">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-inner relative group">
                <ShieldCheck size={40} className="group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-25" />
              </div>
              
              <h1 className="text-3xl font-display font-bold mb-3 tracking-tight">Security Verification</h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] md:max-w-xs">
                We've sent a 6-digit security code to your registered details:
              </p>
              
              <div className="mt-4 px-4 py-2 bg-secondary/50 rounded-2xl border flex items-center gap-2 text-xs font-semibold max-w-full">
                {isPhone ? <Phone size={14} className="text-primary shrink-0" /> : <Mail size={14} className="text-primary shrink-0" />}
                <span className="truncate max-w-[200px]" title={target}>{target}</span>
              </div>
            </div>

            <div className="space-y-8 relative">
              <div className="flex flex-col items-center gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Enter 6-Digit OTP
                </label>
                
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    if (val.length === 6) {
                      handleVerify(val);
                    }
                  }}
                  disabled={isLoading}
                >
                  <InputOTPGroup className="gap-2.5">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="w-12 h-14 border rounded-xl text-lg font-bold font-sans bg-background focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all text-center flex items-center justify-center select-none"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleVerify(otp)}
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/10 relative overflow-hidden"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Code...</span>
                    </div>
                  ) : (
                    <span>Verify & Continue</span>
                  )}
                </button>

                <div className="flex items-center justify-between px-2 pt-2">
                  <button
                    onClick={handleResend}
                    disabled={countdown > 0 || isResending || isLoading}
                    className="text-xs font-bold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline flex items-center gap-1.5 transition-colors"
                  >
                    {isResending ? (
                      <RefreshCw size={12} className="animate-spin text-primary" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    Resend Code
                  </button>

                  <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                    {countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      <span className="text-emerald-600 font-semibold">Ready to resend</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t pt-6 text-center text-xs">
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold transition-colors"
              >
                <ArrowLeft size={12} /> Use a different email or phone number
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyOtp;
