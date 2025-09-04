import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  label,
  icon,
  fullWidth,
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
      bg-blue-600 text-white font-medium hover:bg-blue-700 transition 
      disabled:opacity-50 disabled:cursor-not-allowed 
      ${fullWidth ? "w-full" : ""} ${props.className || ""}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {label || children}
    </button>
  );
};

export default Button;


