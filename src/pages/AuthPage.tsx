import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import type { AuthForm } from "../types/Auth";
import { login, Register, verifyOtp, resendOtp } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import { ShieldCheck, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useSocketContext } from "../hooks/useSocket";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use"; 

type AuthStep = "form" | "otp";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [step, setStep] = useState<AuthStep>("form");
  const [loading, setLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(120); // 2 minutes
  const [userEmail, setUserEmail] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  const { width, height } = useWindowSize();
  const navigate = useNavigate();
  const { connectSocket } = useSocketContext();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate("/room", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let intervalId: number;
    if (step === "otp" && timer > 0) {
      intervalId = window.setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(intervalId!);
  }, [step, timer]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthForm>();

  const onAuthSubmit = async (data: AuthForm) => {
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(data);
        const { accessToken: jwt, name } = res.data;
        localStorage.setItem("accessToken", jwt);
        connectSocket(jwt);
        toast.success(`Welcome back, ${name}! 🎉`);
        navigate("/room", { replace: true });
      } else {
        await Register(data);
        setUserEmail(data.email);
        setStep("otp");
        setTimer(120);
        toast.success("Verification code sent to your email! 📧");
      }
    } catch (error: any) {
      console.log(error,'sssssss')
      const errMessage = error.response?.data?.message || "Authentication failed";
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const onVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = (e.target as any).otp.value;
    if (!otp || otp.length !== 6) return toast.error("Please enter a valid 6-digit OTP");

    setLoading(true);
    try {
      await verifyOtp(userEmail, otp);
      setShowConfetti(true);
      toast.success("Registration complete! Please login. 🎈");
      setTimeout(() => {
        setShowConfetti(false);
        setIsLogin(true);
        setStep("form");
        reset();
      }, 5000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await resendOtp(userEmail);
      setTimer(120);
      toast.success("New code sent! Check your inbox.");
    } catch (error: any) {
      toast.error("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-1 font-sans rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl z-10"
      >
        <div className="bg-[#1e293b]/80 p-8 rounded-[2.3rem] w-full">
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="auth-form"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-black text-white tracking-tight mb-2">
                    {isLogin ? "Welcome Back" : "Get Started"}
                  </h2>
                  <p className="text-gray-400 font-medium">
                    {isLogin ? "Continue your conversations" : "Join the modern chat experience"}
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit(onAuthSubmit)}>
                  {!isLogin && (
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="John Doe"
                      error={errors.name?.message}
                      {...register("name", { required: "Name is required" })}
                    />
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@company.com"
                    error={errors.email?.message}
                    {...register("email", { 
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                    })}
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" },
                    })}
                  />

                  <Button type="submit" fullWidth loading={loading}>
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1e293b] px-2 text-gray-500 font-bold">Or continue with</span></div>
                  </div>

                  <div className="mt-6">
                    <GoogleAuthButton />
                  </div>
                </div>

                <p className="text-center text-gray-400 mt-8 font-medium">
                  {isLogin ? "New here?" : "Joined us before?"}{" "}
                  <button
                    type="button"
                    className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                    onClick={() => { setIsLogin(!isLogin); reset(); }}
                  >
                    {isLogin ? "Create an account" : "Log in to your account"}
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => setStep("form")} 
                  className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors font-semibold"
                >
                  <ArrowLeft size={18} /> Back to Register
                </button>

                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 text-indigo-400">
                    <Mail size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">Verify Email</h2>
                  <p className="text-gray-400 font-medium">
                    We've sent a 6-digit code to <br/>
                    <span className="text-indigo-300 font-bold">{userEmail}</span>
                  </p>
                </div>

                <form onSubmit={onVerifySubmit} className="space-y-6">
                  <div className="relative">
                    <input
                      name="otp"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      className="w-full text-center text-4xl tracking-[0.5em] font-black py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white focus:border-indigo-500 outline-none transition-all placeholder:text-gray-700"
                      required
                    />
                  </div>

                  <Button type="submit" fullWidth loading={loading} icon={<ShieldCheck />}>
                    Verify & Complete
                  </Button>

                  <div className="text-center">
                    <p className="text-gray-500 font-medium mb-3">Didn't receive the code?</p>
                    <button
                      type="button"
                      disabled={timer > 0 || loading}
                      onClick={handleResendOtp}
                      className="flex items-center justify-center gap-2 mx-auto text-indigo-400 font-bold disabled:text-gray-600 transition-colors group"
                    >
                      <RefreshCw size={18} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                      {timer > 0 ? `Resend in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}` : "Resend New Code"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
