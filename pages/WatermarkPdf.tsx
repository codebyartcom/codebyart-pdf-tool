import React, { useState } from 'react';
import { Type, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import Tooltip from '../components/Tooltip';
import { PdfFile } from '../types';
import { addWatermark } from '../services/pdfService';

const WatermarkPdf: React.FC = () => {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [size, setSize] = useState(50);
  const [color, setColor] = useState('#FF0000');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = (files: PdfFile[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const bytes = await addWatermark(file, text, opacity, color, size);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error applying watermark:', error);
      alert('Failed to apply watermark. Please try again.');
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
          <h1 className="text-3xl font-bold text-slate-900">Add Watermark</h1>
          <p className="text-slate-500">Overlay text on every page of your PDF.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {!file ? (
             <FileUploader 
                accept=".pdf" 
                onFilesSelected={handleFileSelected}
                description="Upload a PDF to watermark"
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
                    onClick={() => setFile(null)}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Change File
                  </button>
                </Tooltip>
             </div>
             
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Watermark Text</label>
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="e.g. DRAFT"
                    />

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                            <input 
                                type="color" 
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-full h-10 rounded-lg cursor-pointer border border-slate-300 p-1"
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Opacity: {Math.round(opacity * 100)}%</label>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="1" 
                                step="0.1"
                                value={opacity}
                                onChange={(e) => setOpacity(Number(e.target.value))}
                                className="w-full"
                            />
                         </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Font Size: {size}px</label>
                        <input 
                            type="range" 
                            min="10" 
                            max="150" 
                            step="5"
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200 h-64 overflow-hidden relative">
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div 
                           style={{ 
                               color: color, 
                               opacity: opacity, 
                               fontSize: `${size}px`,
                               transform: 'rotate(-45deg)',
                               fontWeight: 'bold',
                               whiteSpace: 'nowrap'
                           }}
                         >
                             {text || 'Text'}
                         </div>
                     </div>
                     <div className="text-slate-300 text-sm">Preview (Center)</div>
                </div>
             </div>

            <div className="flex justify-end pt-4">
              <Tooltip content="Apply watermark and download" position="top">
                <button
                  onClick={handleApply}
                  disabled={!text || isProcessing}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
                    ${!text || isProcessing 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>Apply Watermark</span>
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

export default WatermarkPdf;