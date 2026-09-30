import * as React from "react";
import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react"; // Default icon placeholder

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 bg-paper-2 rounded-[16px] border-[1.5px] border-dashed border-ink-soft/30 min-h-[200px]",
        className
      )}
      {...props}
    >
      <div className="mb-4 text-ink-soft/50">
        {icon || <Leaf className="w-12 h-12" />}
      </div>
      <h3 className="font-display text-xl text-ink mb-2">{title}</h3>
      <p className="text-ink-soft text-base mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
