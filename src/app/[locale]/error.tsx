"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-paper-2 border-[1.5px] border-terracotta p-12 rounded-[16px] shadow-print max-w-lg w-full">
        <AlertOctagon className="w-16 h-16 text-terracotta mx-auto mb-6" />
        <h1 className="font-display text-4xl text-ink mb-2">Something went wrong</h1>
        <p className="text-ink-soft mb-8">
          An unexpected error occurred. You can try recovering the page.
        </p>
        <Button variant="primary" onClick={() => reset()} className="bg-ink hover:bg-ink-soft text-paper">
          <RotateCcw className="w-5 h-5 mr-2" /> Try Again
        </Button>
      </div>
    </div>
  );
}
