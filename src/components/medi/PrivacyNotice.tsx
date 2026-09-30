"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, EyeOff } from "lucide-react";

export function PrivacyNotice({
  onAccept,
  onTypeManually
}: {
  onAccept: () => void;
  onTypeManually?: () => void;
}) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-paper-2 rounded-[16px] border-[1.5px] border-ink shadow-print">
      <h2 className="font-display text-3xl text-ink mb-6 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-nil" />
        Privacy First
      </h2>
      
      <div className="space-y-6 text-lg text-ink-soft mb-8">
        <p>
          Before you upload your hospital bill, here is what you need to know about how we handle your data.
        </p>
        
        <ul className="space-y-4">
          <li className="flex gap-4">
            <EyeOff className="w-6 h-6 shrink-0 text-ink mt-1" />
            <span><strong>Redact before upload:</strong> You will be able to black out names, phone numbers, and patient IDs before our system reads the bill.</span>
          </li>
          <li className="flex gap-4">
            <FileText className="w-6 h-6 shrink-0 text-ink mt-1" />
            <span><strong>No storage:</strong> We process the bill in memory to extract fields. The image is never saved to our servers or used for anything else.</span>
          </li>
          <li className="flex gap-4">
            <ShieldCheck className="w-6 h-6 shrink-0 text-ink mt-1" />
            <span><strong>Data stays local:</strong> Your case history is saved only in this browser. You can delete it at any time.</span>
          </li>
        </ul>
        
      </div>

      <div className="flex flex-col gap-6 pt-6 border-t-[1.5px] border-dashed border-ink-soft/30">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            className="mt-1 w-5 h-5 accent-nil border-ink rounded focus:ring-nil"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span className="text-ink group-hover:text-ink-soft transition-colors select-none">
            I understand how my data will be used and want to proceed.
          </span>
        </label>
        
        <div className="flex justify-end gap-4">
          {onTypeManually && (
            <Button variant="quiet" onClick={onTypeManually}>
              Type Manually
            </Button>
          )}
          <Button variant="primary" disabled={!accepted} onClick={onAccept} className="bg-nil hover:bg-nil/90">
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
