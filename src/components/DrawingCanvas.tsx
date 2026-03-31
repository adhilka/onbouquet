import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Eraser, Pen, Check, Trash2, Download } from "lucide-react";
import { cn } from "../lib/utils";

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onClose: () => void;
  accentColor: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, onClose, accentColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set initial canvas state
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("changedTouches" in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        return { x: 0, y: 0 };
      }
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Scale coordinates to match canvas internal resolution
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Draw a single point (dot) immediately
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
    ctx.lineWidth = brushSize;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.lineTo(x, y);
    ctx.stroke();

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if ("touches" in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
    ctx.lineWidth = brushSize;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Find the bounding box of the drawing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    let hasContent = false;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          hasContent = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasContent) {
      onClose();
      return;
    }

    // Add some padding
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);

    const width = maxX - minX;
    const height = maxY - minY;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
    onSave(tempCanvas.toDataURL("image/png"));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Find the bounding box of the drawing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    let hasContent = false;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          hasContent = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasContent) return;

    // Add some padding
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);

    const width = maxX - minX;
    const height = maxY - minY;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
    
    const link = document.createElement("a");
    link.download = "my-flower.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  };

  const colors = [
    "#000000", "#EF4444", "#F97316", "#FACC15", 
    "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899",
    "#FFFFFF"
  ];

  return (
    <div className="flex flex-col gap-2 h-full max-h-[80vh]">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-sketch font-bold text-stone-800">Draw Flower</h3>
        <button 
          onClick={clearCanvas}
          className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
          title="Clear"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="relative flex-1 bg-white rounded-xl border-2 border-stone-800 sketch-border overflow-hidden touch-none min-h-[200px] aspect-square mx-auto w-full max-w-[400px]">
        {!isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <p className="text-stone-800 font-sketch font-bold text-lg">Draw here...</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between bg-stone-50 p-2 rounded-xl border-2 border-stone-800 sketch-border">
        <div className="flex gap-1">
          <button
            onClick={() => setTool("pen")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              tool === "pen" ? "bg-stone-800 text-white" : "bg-white text-stone-400"
            )}
          >
            <Pen size={16} />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              tool === "eraser" ? "bg-stone-800 text-white" : "bg-white text-stone-400"
            )}
          >
            <Eraser size={16} />
          </button>
        </div>

        <div className="flex gap-1 flex-wrap justify-center">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool("pen");
              }}
              className={cn(
                "w-5 h-5 rounded-full border border-stone-200 transition-transform hover:scale-110",
                color === c && tool === "pen" && "ring-2 ring-stone-800 ring-offset-1"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-16 h-1 accent-stone-800"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2 bg-white text-stone-800 font-bold rounded-xl border-2 border-stone-800 sketch-border active:scale-95 transition-all text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleDownload}
          className="w-10 py-2 bg-white text-stone-800 font-bold rounded-xl border-2 border-stone-800 sketch-border active:scale-95 transition-all flex items-center justify-center"
          title="Download Flower"
        >
          <Download size={16} />
        </button>
        <button
          onClick={handleSave}
          className={cn(
            "flex-2 py-2 text-white font-bold rounded-xl border-2 sketch-border active:scale-95 transition-all flex items-center justify-center gap-2 text-sm",
            accentColor
          )}
        >
          <Check size={18} /> Add
        </button>
      </div>
    </div>
  );
};
