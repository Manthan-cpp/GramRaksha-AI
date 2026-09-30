"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-paper-2 border-[1.5px] border-ink p-12 rounded-[16px] shadow-print max-w-lg w-full">
        <AlertCircle className="w-16 h-16 text-terracotta mx-auto mb-6" />
        <h1 className="font-display text-4xl text-ink mb-2">Page Not Found</h1>
        <p className="text-ink-soft mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="primary" className="bg-ink text-paper hover:bg-ink-soft">
            <Home className="w-5 h-5 mr-2" /> Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
