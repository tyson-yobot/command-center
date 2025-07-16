// -----------------------------------------------------------------------------
// 📦 YoBot® Button Component — Full Scale, Design-System Match
// File: src/components/ui/button.tsx
// -----------------------------------------------------------------------------

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 🎨 Tailwind utility variants with emoji-labels and gradient support
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        /** 🔵 BRAND‑PRIMARY */
        primary: "bg-[#0d82da] text-white hover:bg-[#1277c0]",
        /** 🔷 YoBot Blue */
        default: "bg-yobot-blue text-white hover:bg-yobot-blue-hover",
        /** 🔷 Legacy Blue */
        blue: "bg-[#0d82da] text-white hover:bg-[#1277c0]",
        /** ⚫ Neutral Gradient */
        secondary: "bg-gradient-to-r from-gray-300 to-gray-500 text-black hover:from-gray-400 hover:to-gray-600",
        /** 🔲 Outlined Action */
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        /** 👻 Ghost Hover */
        ghost: "hover:bg-accent hover:text-accent-foreground",
        /** 🔗 Inline Link */
        link: "underline-offset-4 hover:underline text-primary",
        /** ❌ Destructive Red */
        destructive: "bg-red-600 text-white hover:bg-red-700",
        /** 🚨 Emergency Gradient */
        emergency: "bg-gradient-to-r from-red-600 to-red-900 text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// ✨ Final prop types
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

// 🔁 Forwarded YoBot Button
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
