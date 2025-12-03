import React, { useState } from 'react';
import { RotateCw, ArrowLeft, Download, Loader2, Undo2, Redo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import Tooltip from '../components/Tooltip';
import { PdfFile } from '../types';
import { rotatePdf } from '../services/pdfService';

const RotatePdf: React.FC = () => {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = (files: PdfFile[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleRotateLeft = () => setRotation(prev => (prev - 90));
  const handleRotateRight = () => setRotation(prev => (prev + 90));

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      // Normalize rotation for API
      const r = rotation % 360;
      // pdf-lib rotate adds to existing. If we just want to save with current visual rotation relative to load.
      // We pass the delta.
      const bytes = await rotatePdf(file, r as any);
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rotated_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('Failed to rotate PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Tooltip content="Back to Home" position="right">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors inline-block">
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
        </Tooltip>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rotate PDF</h1>
          <p className="text-slate-500">Rotate all pages in your document.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {!file ? (
             <FileUploader 
                accept=".pdf" 
                onFilesSelected={handleFileSelected}
                description="Upload a PDF to rotate"
            />
        ) : (
          <div className="space-y-8">
             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded text-red-600 font-bold text-sm">PDF</div>
                    <div>
                        <p className="font-medium text-slate-800">{file.name}</p>
                    </div>
                </div>
                <Tooltip content="Select a different PDF" position="left">
                  <button 
                    onClick={() => { setFile(null); setRotation(0); }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Change File
                  </button>
                </Tooltip>
             </div>
             
             <div className="flex flex-col items-center justify-center py-12 space-y-6">
                 <div className="relative w-48 h-64 bg-slate-100 border-2 border-slate-300 border-dashed rounded flex items-center justify-center transition-transform duration-300" 
                      style={{ transform: `rotate(${rotation}deg)` }}>
                    <div className="text-slate-400 font-medium">PDF Content</div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                     <Tooltip content="Rotate Left 90°">
                       <button onClick={handleRotateLeft} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition">
                          <Undo2 size={24} className="text-slate-700" />
                       </button>
                     </Tooltip>
                     <span className="font-mono w-24 text-center font-medium text-slate-600">
                         {rotation % 360}°
                     </span>
                     <Tooltip content="Rotate Right 90°">
                       <button onClick={handleRotateRight} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition">
                          <Redo2 size={24} className="text-slate-700" />
                       </button>
                     </Tooltip>
                 </div>
             </div>

            <div className="flex justify-end">
              <Tooltip content="Save rotated PDF" position="top">
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
                    ${isProcessing 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>Download Rotated PDF</span>
                    </>
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RotatePdf;