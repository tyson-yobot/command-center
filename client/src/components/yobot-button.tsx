import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface YoBotButtonProps {
  variant?: "blue" | "red" | "purple" | "green";
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function YoBotButton({ 
  variant = "blue", 
  children, 
  icon: Icon, 
  onClick, 
  className,
  size = "md",
  disabled = false
}: YoBotButtonProps) {
  const baseStyles = "relative px-4 py-2 rounded-md font-semibold text-white transition duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] overflow-hidden min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm", 
    lg: "px-6 py-3 text-base"
  };

  const variantStyles = {
    blue: "bg-gradient-to-br from-[#0d82da] to-[#085ca2] shadow-[0_0_10px_#0d82da] hover:from-[#1391f5] hover:to-[#0a70c2] hover:ring-1 hover:ring-[#0d82da]/50",
    red: "bg-gradient-to-br from-[#e53935] to-[#b71c1c] shadow-[0_0_10px_#ff4d4d] hover:from-[#f44] hover:to-[#c62828]",
    purple: "bg-gradient-to-br from-[#6a11cb] to-[#2575fc] shadow-[0_0_10px_#6a11cb]/50 hover:from-[#7f1fff] hover:to-[#2c8fff]",
    green: "bg-gradient-to-br from-[#0d82da] to-[#085ca2] shadow-[0_0_10px_#0d82da] hover:from-[#1391f5] hover:to-[#0a70c2]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
    >
      {/* Shine Overlay */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 blur-sm rounded-t-md group-hover:opacity-50 transition-opacity pointer-events-none" />

      {/* Button Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {Icon && <Icon className="text-white text-lg" />}
        <span>{children}</span>
      </div>
    </button>
  );
}