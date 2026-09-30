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
          "inline-flex items-center justify-center rounded-2xl font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-moss text-paper hover:bg-moss-deep": variant === "primary",
            "bg-paper-2 border-[1.5px] border-ink text-ink hover:bg-paper shadow-print": variant === "secondary",
            "bg-transparent text-ink hover:bg-paper-2": variant === "quiet",
            "h-12 px-6 py-2 text-base": size === "default",
            "h-14 px-8 py-4 text-lg": size === "big",
            "h-9 px-3.5 py-1.5 text-xs rounded-xl": size === "sm",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
