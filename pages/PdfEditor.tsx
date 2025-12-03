import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ArrowLeft, ZoomIn, ZoomOut, Move, Type, Pen, Eraser, 
  Download, ChevronLeft, ChevronRight, Save, Loader2, Square 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import Tooltip from '../components/Tooltip';
import { PdfFile, Annotation, DrawingAnnotation, TextAnnotation, RectangleAnnotation } from '../types';
import { modifyPdf } from '../services/pdfService';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

type Tool = 'cursor' | 'pen' | 'text' | 'eraser' | 'redact';

const PdfEditor: React.FC = () => {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  
  const [tool, setTool] = useState<Tool>('cursor');
  const [color, setColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [fontSize, setFontSize] = useState(12);
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingAnnotation | null>(null);
  const [currentRect, setCurrentRect] = useState<Partial<RectangleAnnotation> | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // Refs for rendering
  const canvasRef = useRef<HTMLCanvasElement>(null); // The PDF background
  const overlayRef = useRef<HTMLCanvasElement>(null); // The Drawing layer
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF when file is selected
  useEffect(() => {
    const loadPdf = async () => {
      if (!file) return;
      setIsLoadingPdf(true);
      try {
        const arrayBuffer = await file.file.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(1);
      } catch (error) {
        console.error("Error loading PDF", error);
        alert("Failed to load PDF.");
      } finally {
        setIsLoadingPdf(false);
      }
    };
    loadPdf();
  }, [file]);

  // Render Page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF content
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Resize overlay canvas to match
        if (overlayRef.current) {
            overlayRef.current.height = viewport.height;
            overlayRef.current.width = viewport.width;
            renderAnnotations(); // Re-render annotations on resize/page change
        }

      } catch (error) {
        console.error("Render error", error);
      }
    };
    renderPage();
  }, [pdfDoc, pageNum, scale]);

  // Render annotations on the overlay canvas
  const renderAnnotations = () => {
    if (!overlayRef.current) return;
    const ctx = overlayRef.current.getContext('2d');
    if (!ctx) return;

    // Clear overlay
    ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

    // Filter annotations for current page
    const pageAnns = annotations.filter(a => a.page === pageNum);

    pageAnns.forEach(ann => {
        if (ann.type === 'drawing') {
            ctx.beginPath();
            ctx.strokeStyle = ann.color;
            ctx.lineWidth = ann.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (ann.points.length > 0) {
                ctx.moveTo(ann.points[0].x * scale, ann.points[0].y * scale);
                for (let i = 1; i < ann.points.length; i++) {
                    ctx.lineTo(ann.points[i].x * scale, ann.points[i].y * scale);
                }
            }
            ctx.stroke();
        } else if (ann.type === 'text') {
            ctx.font = `${ann.size * scale}px sans-serif`;
            ctx.fillStyle = ann.color;
            ctx.fillText(ann.text, ann.x * scale, ann.y * scale);
        } else if (ann.type === 'rectangle') {
            ctx.fillStyle = ann.color;
            ctx.fillRect(ann.x * scale, ann.y * scale, ann.width * scale, ann.height * scale);
        }
    });

    // Render current stroke being drawn
    if (currentStroke) {
        ctx.beginPath();
        ctx.strokeStyle = currentStroke.color;
        ctx.lineWidth = currentStroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (currentStroke.points.length > 0) {
            ctx.moveTo(currentStroke.points[0].x * scale, currentStroke.points[0].y * scale);
            for (let i = 1; i < currentStroke.points.length; i++) {
                ctx.lineTo(currentStroke.points[i].x * scale, currentStroke.points[i].y * scale);
            }
        }
        ctx.stroke();
    }

    // Render current rect being drawn (Redact)
    if (currentRect && currentRect.x !== undefined && currentRect.y !== undefined && currentRect.width !== undefined && currentRect.height !== undefined) {
         ctx.fillStyle = '#000000'; // Redact is always black in preview
         ctx.fillRect(currentRect.x * scale, currentRect.y * scale, currentRect.width * scale, currentRect.height * scale);
    }
  };

  // Redraw when annotations or stroke changes
  useEffect(() => {
    renderAnnotations();
  }, [annotations, currentStroke, currentRect, pageNum, scale]);

  // Handle Mouse Events for Drawing/Interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'cursor') return;
    
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (tool === 'pen') {
        setCurrentStroke({
            id: Date.now().toString(),
            type: 'drawing',
            page: pageNum,
            points: [{x, y}],
            color,
            width: penWidth
        });
    } else if (tool === 'text') {
        const text = prompt("Enter text:");
        if (text) {
            setAnnotations(prev => [...prev, {
                id: Date.now().toString(),
                type: 'text',
                page: pageNum,
                x,
                y,
                text,
                size: fontSize,
                color
            }]);
        }
    } else if (tool === 'redact') {
        setCurrentRect({
            x, y, width: 0, height: 0, 
        });
    } else if (tool === 'eraser') {
        setAnnotations(prev => prev.filter(ann => {
             if (ann.page !== pageNum) return true;
             return true; // Simplified for MVP
        }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (tool === 'pen' && currentStroke) {
        setCurrentStroke(prev => prev ? {
            ...prev,
            points: [...prev.points, {x, y}]
        } : null);
    } else if (tool === 'redact' && currentRect && currentRect.x !== undefined && currentRect.y !== undefined) {
        setCurrentRect(prev => prev ? {
            ...prev,
            width: x - prev.x!,
            height: y - prev.y!
        } : null);
    }
  };

  const handleMouseUp = () => {
    if (tool === 'pen' && currentStroke) {
        setAnnotations(prev => [...prev, currentStroke]);
        setCurrentStroke(null);
    } else if (tool === 'redact' && currentRect) {
        if (currentRect.width && currentRect.height) {
             setAnnotations(prev => [...prev, {
                 id: Date.now().toString(),
                 type: 'rectangle',
                 page: pageNum,
                 x: currentRect.x!,
                 y: currentRect.y!,
                 width: currentRect.width!,
                 height: currentRect.height!,
                 color: '#000000' // Black for redaction
             }]);
        }
        setCurrentRect(null);
    }
  };

  const undoLast = () => {
      setAnnotations(prev => {
          // find last annotation on current page
          const currentPageAnns = prev.filter(a => a.page === pageNum);
          if (currentPageAnns.length === 0) return prev;
          const lastId = currentPageAnns[currentPageAnns.length - 1].id;
          return prev.filter(a => a.id !== lastId);
      });
  };

  const handleSave = async () => {
      if (!file) return;
      setIsProcessing(true);
      try {
          // Normalize drawings relative to unscaled PDF coords
          const pdfBytes = await modifyPdf(file, annotations);
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `edited_${file.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (e) {
          console.error(e);
          alert("Failed to save PDF");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleFileSelected = (files: PdfFile[]) => {
      if(files.length > 0) setFile(files[0]);
  };

  if (!file) {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Tooltip content="Back to Home" position="right">
                <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors inline-block">
                    <ArrowLeft size={24} className="text-slate-600" />
                </Link>
                </Tooltip>
                <div>
                <h1 className="text-3xl font-bold text-slate-900">Edit & View PDF</h1>
                <p className="text-slate-500">View, Sign, Annotate, and Fill forms.</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <FileUploader 
                    accept=".pdf" 
                    onFilesSelected={handleFileSelected} 
                    description="Upload a PDF to view or edit"
                />
            </div>
        </div>
      );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-100">
        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-between shadow-sm z-10 flex-wrap gap-2">
            <div className="flex items-center gap-2">
                <Tooltip content="Back to Home">
                    <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                        <ArrowLeft size={20} />
                    </Link>
                </Tooltip>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <Tooltip content="Previous Page">
                    <button 
                        onClick={() => setPageNum(p => Math.max(1, p - 1))}
                        disabled={pageNum <= 1}
                        className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </Tooltip>
                <span className="text-sm font-medium text-slate-700 min-w-[80px] text-center">
                    {pageNum} / {numPages}
                </span>
                <Tooltip content="Next Page">
                    <button 
                        onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
                        disabled={pageNum >= numPages}
                        className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                    >
                        <ChevronRight size={20} />
                    </button>
                </Tooltip>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <Tooltip content="Zoom Out">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-slate-100 rounded-lg">
                        <ZoomOut size={20} />
                    </button>
                </Tooltip>
                <span className="text-sm text-slate-600 w-12 text-center">{Math.round(scale * 100)}%</span>
                <Tooltip content="Zoom In">
                    <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-2 hover:bg-slate-100 rounded-lg">
                        <ZoomIn size={20} />
                    </button>
                </Tooltip>
            </div>

            <div className="flex items-center gap-2">
                 <Tooltip content="Select / Move">
                    <button 
                        onClick={() => setTool('cursor')}
                        className={`p-2 rounded-lg ${tool === 'cursor' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'}`}
                    >
                        <Move size={20} />
                    </button>
                 </Tooltip>
                 <Tooltip content="Add Text">
                    <button 
                        onClick={() => setTool('text')}
                        className={`p-2 rounded-lg ${tool === 'text' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'}`}
                    >
                        <Type size={20} />
                    </button>
                 </Tooltip>
                 <Tooltip content="Freehand / Sign">
                    <button 
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded-lg ${tool === 'pen' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'}`}
                    >
                        <Pen size={20} />
                    </button>
                 </Tooltip>
                 <Tooltip content="Redact (Cover with Black Box)">
                    <button 
                        onClick={() => setTool('redact')}
                        className={`p-2 rounded-lg ${tool === 'redact' ? 'bg-red-100 text-red-700' : 'hover:bg-slate-100'}`}
                    >
                        <Square size={20} fill="currentColor" />
                    </button>
                 </Tooltip>
                 <Tooltip content="Undo Last Annotation">
                    <button onClick={undoLast} className="p-2 hover:bg-slate-100 rounded-lg">
                        <Eraser size={20} />
                    </button>
                 </Tooltip>

                 {/* Style controls */}
                 {(tool === 'pen' || tool === 'text') && (
                     <div className="flex items-center gap-2 ml-2 border-l pl-2 border-slate-200">
                         <input 
                            type="color" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                         />
                         {tool === 'pen' && (
                             <select 
                                value={penWidth} 
                                onChange={(e) => setPenWidth(Number(e.target.value))}
                                className="text-sm border-slate-200 rounded p-1"
                             >
                                 <option value="1">Thin</option>
                                 <option value="2">Normal</option>
                                 <option value="5">Thick</option>
                                 <option value="10">Marker</option>
                             </select>
                         )}
                         {tool === 'text' && (
                             <select 
                                value={fontSize} 
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="text-sm border-slate-200 rounded p-1"
                             >
                                 <option value="12">Small</option>
                                 <option value="16">Medium</option>
                                 <option value="24">Large</option>
                             </select>
                         )}
                     </div>
                 )}
            </div>

            <div className="flex items-center gap-2">
                 <button 
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                 >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>Save</span>
                 </button>
            </div>
        </div>

        {/* Workspace */}
        <div 
            ref={containerRef}
            className="flex-grow overflow-auto flex justify-center p-8 bg-slate-100 relative"
        >
            {isLoadingPdf && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-50">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                </div>
            )}
            
            <div className="relative shadow-lg" style={{ width: 'fit-content', height: 'fit-content' }}>
                <canvas ref={canvasRef} className="bg-white block" />
                <canvas 
                    ref={overlayRef}
                    className="absolute inset-0 cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ pointerEvents: tool === 'cursor' ? 'none' : 'auto' }}
                />
            </div>
        </div>
    </div>
  );
};

export default PdfEditor;