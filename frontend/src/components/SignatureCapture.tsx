import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, RotateCcw, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface SignatureCaptureProps {
  signatureType: 'drawn' | 'uploaded';
  onTypeChange: (type: 'drawn' | 'uploaded') => void;
  onDrawnSignatureChange: (dataUrl: string) => void;
  onUploadedFileChange: (file: File | null, previewUrl: string) => void;
  initialSignatureData?: string;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  signatureType,
  onTypeChange,
  onDrawnSignatureChange,
  onUploadedFileChange,
  initialSignatureData
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number }>>([]);
  const [hasDrawnContent, setHasDrawnContent] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(initialSignatureData || '');
  const [uploadError, setUploadError] = useState<string>('');

  // Setup canvas resolution and styling
  useEffect(() => {
    if (signatureType !== 'drawn') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep navy/black ink
    ctx.lineWidth = 2.5;

    redrawStrokes(strokes, ctx);
  }, [signatureType]);

  const redrawStrokes = (
    allStrokes: Array<Array<{ x: number; y: number }>>,
    ctx: CanvasRenderingContext2D
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of allStrokes) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  };

  // Helper to get coordinates from mouse/touch relative to canvas
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setCurrentStroke([coords]);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }

    setCurrentStroke(prev => [...prev, coords]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const updatedStrokes = [...strokes, currentStroke];
      setStrokes(updatedStrokes);
      setHasDrawnContent(true);
      generateTrimmedSignature(updatedStrokes);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStrokes([]);
    setCurrentStroke([]);
    setHasDrawnContent(false);
    setPreviewImage('');
    onDrawnSignatureChange('');
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    redrawStrokes(newStrokes, ctx);

    if (newStrokes.length > 0) {
      generateTrimmedSignature(newStrokes);
    } else {
      setHasDrawnContent(false);
      setPreviewImage('');
      onDrawnSignatureChange('');
    }
  };

  // Crop excess whitespace/margins from drawn canvas
  const generateTrimmedSignature = (currentStrokes: Array<Array<{ x: number; y: number }>>) => {
    const canvas = canvasRef.current;
    if (!canvas || currentStrokes.length === 0) return;

    // Find bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const stroke of currentStrokes) {
      for (const pt of stroke) {
        if (pt.x < minX) minX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
      }
    }

    // Add padding
    const padding = 10;
    const dpr = window.devicePixelRatio || 1;
    minX = Math.max(0, (minX - padding) * dpr);
    minY = Math.max(0, (minY - padding) * dpr);
    maxX = Math.min(canvas.width, (maxX + padding) * dpr);
    maxY = Math.min(canvas.height, (maxY + padding) * dpr);

    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);

    // Create offscreen canvas for cropped image
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = width;
    cropCanvas.height = height;
    const cropCtx = cropCanvas.getContext('2d');

    if (cropCtx) {
      cropCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
      const dataUrl = cropCanvas.toDataURL('image/png');
      setPreviewImage(dataUrl);
      onDrawnSignatureChange(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validMimes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid file type. Please upload a PNG, JPG, or JPEG signature image.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File is too large. Signature image must be smaller than 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      onUploadedFileChange(file, result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Mode selection tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => onTypeChange('drawn')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            signatureType === 'drawn'
              ? 'border-gov-blue text-gov-blue bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Draw on Screen</span>
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('uploaded')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            signatureType === 'uploaded'
              ? 'border-gov-blue text-gov-blue bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* DRAW MODE */}
      {signatureType === 'drawn' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Sign inside the box below using your mouse, trackpad, finger, or stylus. Touch and mobile friendly.
          </p>
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              className="w-full h-44 touch-none cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawnContent && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-sm italic">
                Sign here
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-1">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={!hasDrawnContent}
                className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
            {hasDrawnContent && (
              <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Signature recorded</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD MODE */}
      {signatureType === 'uploaded' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Upload a photo or scanned copy of your handwritten signature. Supported formats: PNG, JPG, JPEG (Max 5MB).
          </p>

          <label className="border-2 border-dashed border-slate-300 hover:border-gov-blue hover:bg-sky-50/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm font-semibold text-slate-700">Click to browse or drag & drop</span>
            <span className="text-xs text-slate-500 mt-1">PNG, JPG, or JPEG</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadError && (
            <p className="text-xs text-red-600 font-medium">{uploadError}</p>
          )}
        </div>
      )}

      {/* PREVIEW OF SIGNATURE */}
      {previewImage && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-gov-blue" />
              <span>Signature Preview (Aspect Ratio Preserved)</span>
            </span>
            <span className="text-xs text-slate-400">Appears above typed name</span>
          </div>
          <div className="h-16 flex items-center justify-center bg-white border border-slate-200 rounded p-2">
            <img
              src={previewImage}
              alt="Applicant Signature Preview"
              className="max-h-14 max-w-[200px] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
