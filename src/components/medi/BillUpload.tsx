"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, Camera, FileImage, Sparkles } from "lucide-react";

export function BillUpload({
  onFileSelect,
  onTypeManually
}: {
  onFileSelect: (file: File) => void;
  onTypeManually?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-ink mb-2">Upload Hospital Bill</h2>
        <p className="text-ink-soft">Make sure the image is clear and well-lit.</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-[16px] p-12 text-center transition-colors ${
          isDragging ? "border-nil bg-nil/5" : "border-ink-soft/30 bg-paper-2 hover:border-nil/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex justify-center mb-4 text-ink-soft">
          <FileImage className="w-16 h-16" />
        </div>
        <h3 className="text-xl font-display text-ink mb-2">Drag and drop your bill here</h3>
        <p className="text-ink-soft mb-6">Supports JPG, PNG, or PDF</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,application/pdf"
          onChange={handleChange}
        />
        
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="w-5 h-5 mr-2" /> Browse Files
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="hidden sm:flex">
            <Camera className="w-5 h-5 mr-2" /> Take Photo
          </Button>
        </div>

        <div className="mt-6 pt-5 border-t border-ink-soft/20 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                const response = await fetch("/sample-hospital-bill.jpg");
                const blob = await response.blob();
                const file = new File([blob], "city-care-hospital-bill.jpg", { type: "image/jpeg" });
                onFileSelect(file);
              } catch {
                // Fallback
              }
            }}
            className="border-nil text-nil hover:bg-nil/10 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-1.5" /> Try with Demo Bill Image (Pune Appendectomy)
          </Button>
          <a
            href="/sample-hospital-bill.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink-soft hover:text-nil underline"
          >
            View / Download Bill ↗
          </a>
        </div>

        {onTypeManually && (
          <div className="mt-4 pt-4 border-t border-ink-soft/20 text-center">
            <p className="text-sm text-ink-soft mb-1">No photo or bill document on hand?</p>
            <Button variant="quiet" onClick={onTypeManually} className="text-nil hover:underline text-xs">
              Enter bill details manually →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
