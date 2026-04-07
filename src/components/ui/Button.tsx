import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  fullWidth,
  children,
  loading,
  className,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...(props as any)}
      disabled={disabled || loading}
      className={`relative flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl 
      bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold
      transition-all duration-300 shadow-lg shadow-indigo-500/25
      hover:shadow-indigo-500/40 hover:brightness-110 
      disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale
      ${fullWidth ? "w-full" : ""} ${className || ""}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        <>
          {icon && <span className="text-xl">{icon}</span>}
          {label || children}
        </>
      )}
    </motion.button>
  );
};

export default Button;


