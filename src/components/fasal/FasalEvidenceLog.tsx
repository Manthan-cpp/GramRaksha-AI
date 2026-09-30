"use client";

import { useState, useRef } from "react";
import { useLocale } from "next-intl";
import { FasalPhotoEvidence } from "@/lib/schemas";
import {
  Camera,
  Upload,
  Trash2,
  Lock,
  Clock,
  X
} from "lucide-react";

interface FasalEvidenceLogProps {
  photos: FasalPhotoEvidence[];
  onChange: (photos: FasalPhotoEvidence[]) => void;
  disabled?: boolean;
}

export function FasalEvidenceLog({
  photos,
  onChange,
  disabled = false
}: FasalEvidenceLogProps) {
  const locale = useLocale() as "en" | "hi" | "bn";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedPreview, setSelectedPreview] = useState<FasalPhotoEvidence | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        const newPhoto: FasalPhotoEvidence = {
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          dataUrl,
          timestamp: new Date().toISOString(),
          fileSize: file.size,
          caption: file.name
        };

        onChange([...photos, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-paper rounded-2xl border border-ink/15 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl text-ink">
              {locale === "hi" ? "स्थानीय फसल क्षति साक्ष्य (फ़ोटो लॉग)" : locale === "bn" ? "স্থানীয় ফসলের ক্ষতির প্রমাণ (ফটো লগ)" : "On-Field Damage Evidence Log"}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-moss/20 text-moss-deep">
              {photos.length} {locale === "hi" ? "फ़ोटो" : locale === "bn" ? "টি ছবি" : "Photos"}
            </span>
          </div>
          <p className="text-xs text-ink-soft mt-0.5">
            {locale === "hi"
              ? "समय-अंकित फ़ोटो संयुक्त सर्वेक्षण (Joint Panchnama) में दावे की पुष्टि हेतु आवश्यक हैं।"
              : locale === "bn"
              ? "যৌথ পরিদর্শনের সময় দাবির প্রমাণ হিসেবে টাইমস্ট্যাম্পযুক্ত ছবি অপরিহার্য।"
              : "Timestamped field photos serve as legal corroboration during the official joint spot assessment."}
          </p>
        </div>

        {/* Local Storage Privacy Guarantee */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink/5 border border-ink/10 text-xs font-mono text-ink-soft">
          <Lock className="w-3.5 h-3.5 text-moss-deep" />
          <span>{locale === "hi" ? "100% स्थानीय डिवाइस संग्रह — कोई क्लाउड अपलोड नहीं" : locale === "bn" ? "১০০% ডিভাইসে সংরক্ষিত — ক্লাউডে যায় না" : "100% On-Device — Never Uploaded to Cloud"}</span>
        </div>
      </div>

      {/* Action buttons */}
      {!disabled && (
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-moss-deep text-paper hover:bg-moss-deep/90 transition-all text-sm font-semibold shadow-sm"
          >
            <Camera className="w-4 h-4" />
            <span>{locale === "hi" ? "खेत में कैमरा से फ़ोटो लें" : locale === "bn" ? "ক্যামেরা দিয়ে ছবি তুলুন" : "Capture Field Photo"}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-paper-2 border border-ink/20 text-ink hover:bg-paper-2/80 transition-all text-sm font-semibold"
          >
            <Upload className="w-4 h-4 text-ink-soft" />
            <span>{locale === "hi" ? "गैलरी से अपलोड करें" : locale === "bn" ? "গ্যালারি থেকে যোগ করুন" : "Upload from Gallery"}</span>
          </button>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-ink/20 p-8 text-center bg-paper-2/40">
          <Camera className="w-10 h-10 text-ink-soft/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-ink">
            {locale === "hi" ? "अभी तक कोई फ़ोटो संलग्न नहीं है" : locale === "bn" ? "এখনো কোনো ছবি যুক্ত করা হয়নি" : "No damage photos attached yet"}
          </p>
          <p className="text-xs text-ink-soft mt-1 max-w-md mx-auto">
            {locale === "hi"
              ? "ओलावृष्टि, जलभराव या बिजली गिरने से प्रभावित फसल के 2-3 स्पष्ट फ़ोटो अवश्य लें ताकि सर्वेक्षक अस्वीकार न कर सके।"
              : locale === "bn"
              ? "ক্ষতিগ্রস্ত ফসলের ২-৩টি পরিষ্কার ছবি তুলুন যা পরবর্তী পরিদর্শনে প্রমাণ হিসেবে কাজ করবে।"
              : "Capture 2-3 clear photographs of the damaged crop parcel to ensure your claim cannot be disputed for lack of evidence."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative rounded-xl overflow-hidden border border-ink/15 bg-paper-2 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.dataUrl}
                alt={`Damage proof ${index + 1}`}
                className="w-full h-36 object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedPreview(photo)}
              />

              {/* Timestamp overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-ink/75 backdrop-blur-sm p-1.5 text-[10px] font-mono text-paper flex items-center justify-between">
                <span className="truncate flex items-center gap-1">
                  <Clock className="w-3 h-3 text-moss" />
                  {new Date(photo.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span>#{index + 1}</span>
              </div>

              {/* Remove button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(photo.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-sm opacity-80 group-hover:opacity-100"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Enlarged Modal Preview */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-paper rounded-2xl max-w-2xl w-full p-4 border border-ink/20 shadow-2xl">
            <button
              onClick={() => setSelectedPreview(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-ink/10 hover:bg-ink/20 text-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-xs font-mono text-ink-soft mb-2">
              Captured: {new Date(selectedPreview.timestamp).toLocaleString()}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPreview.dataUrl}
              alt="Enlarged evidence"
              className="w-full max-h-[70vh] object-contain rounded-xl bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
