import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, type, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className={`block text-sm font-semibold transition-colors duration-200 ${isFocused ? 'text-indigo-400' : 'text-gray-400'}`}>
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          {...props}
          type={inputType}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`w-full px-4 py-2.5 bg-white/5 border-2 rounded-xl text-white placeholder-gray-500
          transition-all duration-300 outline-none
          ${error 
            ? "border-red-500/50 focus:border-red-500 bg-red-500/5" 
            : "border-white/10 group-hover:border-white/20 focus:border-indigo-500 focus:bg-white/10"
          }
          backdrop-blur-sm`}
        />
        
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Focus Glow Effect */}
        <div className={`absolute inset-0 -z-10 rounded-xl bg-indigo-500/20 blur-md transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs font-medium text-red-500 mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
