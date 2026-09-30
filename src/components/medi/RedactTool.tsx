"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Undo, Check } from "lucide-react";

type RedactionRect = { x: number; y: number; w: number; h: number };

export function RedactTool({ file, onComplete }: { file: File, onComplete: (redactedUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rects, setRects] = useState<RedactionRect[]>([]);
  const [currentRect, setCurrentRect] = useState<RedactionRect | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  const drawCanvas = useCallback((img: HTMLImageElement, drawnRects: RedactionRect[], activeRect?: RedactionRect | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxWidth = containerRef.current.clientWidth;
    const scale = Math.min(maxWidth / img.width, 1);

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1B2A22";
    drawnRects.forEach((r) => ctx.fillRect(r.x, r.y, r.w, r.h));

    if (activeRect) {
      ctx.fillStyle = "rgba(27, 42, 34, 0.5)";
      ctx.fillRect(activeRect.x, activeRect.y, activeRect.w, activeRect.h);
    }
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageObj(img);
      drawCanvas(img, []);
    };
    return () => URL.revokeObjectURL(url);
  }, [drawCanvas, file]);

  useEffect(() => {
    if (imageObj) drawCanvas(imageObj, rects, currentRect || undefined);
  }, [drawCanvas, rects, currentRect, imageObj]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDrawing(true);
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;
    
    setCurrentRect({
      x: Math.min(startPos.x, currX),
      y: Math.min(startPos.y, currY),
      w: Math.abs(currX - startPos.x),
      h: Math.abs(currY - startPos.y)
    });
  };

  const handlePointerUp = () => {
    if (isDrawing && currentRect) {
      setRects([...rects, currentRect]);
    }
    setIsDrawing(false);
    setCurrentRect(null);
  };

  const undo = () => setRects(rects.slice(0, -1));

  const handleComplete = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/jpeg");
      onComplete(dataUrl);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-2xl text-ink mb-2">Redact Private Info</h2>
          <p className="text-ink-soft">Draw boxes over names, phone numbers, and IDs to hide them.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="quiet" onClick={undo} disabled={rects.length === 0}>
            <Undo className="w-5 h-5 mr-2" /> Undo
          </Button>
          <Button variant="primary" onClick={handleComplete} className="bg-nil hover:bg-nil/90">
            <Check className="w-5 h-5 mr-2" /> Done
          </Button>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="bg-paper-2 border-[1.5px] border-ink p-4 rounded-[16px] shadow-print flex justify-center overflow-auto max-h-[60vh] cursor-crosshair touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="bg-paper border border-ink-soft/20 shadow-sm rounded"
        />
      </div>
    </div>
  );
}
