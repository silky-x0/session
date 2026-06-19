import React, { useRef, useState, useEffect, useCallback } from "react";
import { useBroadcastEvent, useEventListener, useUpdateMyPresence } from "@liveblocks/react/suspense";
import { Trash2, Eraser, Edit2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeContext";


interface DrawData {
  type: "WHITEBOARD_DRAW";
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  lineWidth: number;
}

interface ClearData {
  type: "WHITEBOARD_CLEAR";
}

// Presets defined in component based on theme


export function Whiteboard() {
  const { theme } = useTheme();
  const updateMyPresence = useUpdateMyPresence();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(() => theme === "light" ? "#000000" : "#00FF41");
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const colors = theme === "light"
    ? ["#009926", "#0088CC", "#E65C00", "#9900CC", "#000000"]
    : ["#00FF41", "#00F0FF", "#FF6B00", "#BC00FF", "#FFFFFF"];

  useEffect(() => {
    setCurrentColor(theme === "light" ? "#000000" : "#00FF41");
  }, [theme]);

  const broadcast = useBroadcastEvent();

  // Draw a single line segment on the canvas
  const drawLine = useCallback((
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    width: number,
    emit = false
  ) => {
    const context = contextRef.current;
    if (!context) return;

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    if (emit) {
      broadcast({
        type: "WHITEBOARD_DRAW",
        x0,
        y0,
        x1,
        y1,
        color,
        lineWidth: width,
      } as DrawData);
    }
  }, [broadcast]);

  // Handle incoming whiteboard events (draw / clear)
  useEventListener(({ event }) => {
    const ev = event as any;
    if (ev.type === "WHITEBOARD_DRAW") {
      drawLine(ev.x0, ev.y0, ev.x1, ev.y1, ev.color, ev.lineWidth, false);
    } else if (ev.type === "WHITEBOARD_CLEAR") {
      clearLocalCanvas();
    }
  });

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleGlobalClear = () => {
    clearLocalCanvas();
    broadcast({ type: "WHITEBOARD_CLEAR" } as ClearData);
  };

  // Re-size and configure canvas context
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Save current content as an image data
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    // Resize canvas to target dimensions
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Reconfigure context properties
    const context = canvas.getContext("2d");
    if (context) {
      context.lineCap = "round";
      context.lineJoin = "round";
      contextRef.current = context;
      
      // Draw back saved content
      context.drawImage(tempCanvas, 0, 0);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Handle drawing start
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    lastPoint.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Handle drawing move
  const handleMoveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;
    const color = isEraser ? (theme === "light" ? "#fafafa" : "#050505") : currentColor; // Match background color for eraser

    drawLine(
      lastPoint.current.x,
      lastPoint.current.y,
      currentX,
      currentY,
      color,
      brushSize,
      true
    );

    lastPoint.current = { x: currentX, y: currentY };
  };

  // Handle drawing end
  const handleEndDraw = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-whiteboard-${Date.now()}.png`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col glass-panel rounded-lg overflow-hidden relative select-none border border-glass-border h-full"
      onMouseEnter={() => updateMyPresence({ hoveredPanel: "whiteboard" })}
      onMouseLeave={() => updateMyPresence({ hoveredPanel: null })}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-glass-border bg-card/50 gap-2">
        {/* Colors & Brush */}
        <div className="flex items-center gap-2">
          {/* Color buttons */}
          <div className="flex items-center gap-1.5 border-r border-glass-border pr-2.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCurrentColor(c);
                  setIsEraser(false);
                }}
                className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                  currentColor === c && !isEraser
                    ? "scale-125 border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Mode Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEraser(false)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                !isEraser ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:bg-white/5"
              }`}
              title="Brush Tool"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isEraser ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:bg-white/5"
              }`}
              title="Eraser Tool"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-4 bg-glass-border mx-1" />

          {/* Brush Sizes */}
          <div className="flex items-center gap-1.5">
            {[2, 5, 10].map((sz) => (
              <button
                key={sz}
                onClick={() => setBrushSize(sz)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  brushSize === sz
                    ? "bg-primary/20 border-primary/30 text-primary"
                    : "bg-white/5 border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {sz === 2 ? "Thin" : sz === 5 ? "Med" : "Bold"}
              </button>
            ))}
          </div>
        </div>

        {/* Global clear & download */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-foreground transition-colors border border-glass-border text-[10px] font-medium uppercase tracking-wider cursor-pointer"
            title="Download drawing"
          >
            <Download className="w-3 h-3" />
            <span>Save</span>
          </button>
          <button
            onClick={handleGlobalClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20 text-[10px] font-medium uppercase tracking-wider cursor-pointer"
            title="Clear canvas for all"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-background relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleStartDraw}
          onMouseMove={handleMoveDraw}
          onMouseUp={handleEndDraw}
          onMouseLeave={handleEndDraw}
          onTouchStart={handleStartDraw}
          onTouchMove={handleMoveDraw}
          onTouchEnd={handleEndDraw}
          className="absolute inset-0 block cursor-crosshair w-full h-full"
        />
      </div>
    </motion.div>
  );
}
