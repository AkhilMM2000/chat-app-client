import React, { useEffect, useState } from "react";
import {useForm}from "react-hook-form";
import {toast}from "react-hot-toast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import type { AuthForm } from "../types/Auth";
import { login, Register } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
const navigate=useNavigate();
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      // user already logged in — redirect to /room and replace history
      navigate("/room", { replace: true });
    }
  }, [navigate]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthForm>();

  const onSubmit = async (data: AuthForm) => {
    setLoading(true);
    try {
      if (isLogin) {
        console.log("Login data:", data);

  const res = await login(data); 
 const {
  accessToken: jwt,
  name,
} = res.data;

 localStorage.setItem("accessToken", jwt);
  navigate("/room", { replace: true });
  toast.success(`Welcome back, ${name}! 🎉`);
  
      } else {
        
        console.log("Register data:", data);
    await Register(data);
        toast.success("Account created!");
      navigate("/room", { replace: true });
      }
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black"
>
  <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl border border-gray-200">
    {/* Title */}
    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
      {isLogin ? "Welcome Back 👋" : "Create an Account 🚀"}
    </h2>
    <p className="text-center text-gray-500 mb-6">
      {isLogin ? "Login to continue chatting" : "Join us and start chatting instantly"}
    </p>

    {/* Form */}
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {!isLogin && (
        <div>
          <Input
            label="Name"
            type="text"
            placeholder="Enter your name"
            {...register("name", { required: !isLogin })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">Name is required</p>
          )}
        </div>
      )}

      <div>
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Min 6 characters" },
          })}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={loading}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform"
      >
        {loading
          ? "Please wait..."
          : isLogin
          ? "Login"
          : "Register"}
      </Button>
    </form>

    {/* Divider */}
    <div className="flex items-center gap-3 my-6">
      <div className="flex-grow h-px bg-gray-300"></div>
      <span className="text-sm text-gray-500">or</span>
      <div className="flex-grow h-px bg-gray-300"></div>
    </div>

    {/* Google login/register button */}
      <GoogleAuthButton />

    {/* Switch between Login & Register */}
    <p className="text-center text-gray-600 mt-6">
      {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
      <button
        type="button"
        className="text-indigo-600 font-semibold hover:underline"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Register" : "Login"}
      </button>
    </p>
  </div>
</div>

  );
};

export default AuthPage;
