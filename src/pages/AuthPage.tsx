import React, { useState } from "react";
import {useForm}from "react-hook-form";
import {toast}from "react-hot-toast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import type { AuthForm } from "../types/Auth";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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
        // 👉 call login API here
        console.log("Login data:", data);
        toast.success("Login successful!");
      } else {
        // 👉 call register API here
        console.log("Register data:", data);
        toast.success("Account created!");
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
    <Button
      type="button"
      fullWidth
      className="bg-white text-gray-700 font-medium border border-gray-300 shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2"
      onClick={() => toast("Google Auth clicked")}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Continue with Google
    </Button>

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
