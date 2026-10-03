import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "quiet";
  size?: "default" | "big" | "sm";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-yellow-400 text-black border-2 border-black hover:bg-yellow-500 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]": variant === "primary",
            "bg-white text-black border-2 border-black hover:bg-gray-100 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]": variant === "secondary",
            "bg-transparent text-ink border-2 border-transparent hover:bg-ink/10 hover:text-ink": variant === "quiet",
            "h-12 px-6 py-2 text-base": size === "default",
            "h-14 px-8 py-4 text-lg": size === "big",
            "h-9 px-4 py-1.5 text-xs": size === "sm",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
