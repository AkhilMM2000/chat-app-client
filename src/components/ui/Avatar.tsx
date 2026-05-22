import React from "react";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  isOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md", className = "", isOnline }) => {
  const displayName = name?.trim() || "User";
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-[12px]",
    md: "w-10 h-10 text-[14px]",
    lg: "w-14 h-14 text-[18px]",
    xl: "w-20 h-20 text-[24px]",
  };

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "?";
  };

  const getColor = (name: string) => {
    const colors = [
      "bg-emerald-500",
      "bg-sky-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
      "bg-orange-500",
      "bg-amber-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hashName(name.charCodeAt(i) + ((hash << 5) - hash));
    }
    function hashName(h: number) { hash = h; }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={displayName}
          className={`${sizeClasses[size]} rounded-2xl object-cover shadow-lg border border-white/10`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${getColor(displayName)} rounded-2xl flex items-center justify-center font-black text-white shadow-lg border border-white/10 uppercase tracking-tighter`}
        >
          {getInitials(displayName)}
        </div>
      )}
      {isOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-950 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] z-10"></span>
      )}
    </div>
  );
};

export default Avatar;
