import React, { useState } from 'react';
import { Minimize2, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import Tooltip from '../components/Tooltip';
import { PdfFile } from '../types';
import { compressPdf } from '../services/pdfService';

const CompressPdf: React.FC = () => {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'high' | 'medium' | 'low'>('medium');

  const handleFileSelected = (files: PdfFile[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      // Configuration for different levels
      // high compression = low quality, medium = balanced, low compression = high quality
      const config = {
        high: { quality: 0.3, scale: 1.0 },
        medium: { quality: 0.6, scale: 1.5 },
        low: { quality: 0.8, scale: 2.0 }
      };
      
      const settings = config[compressionLevel];
      const blob = await compressPdf(file, settings.quality, settings.scale);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('Failed to compress PDF. Please try again or try a different file.');
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
          <h1 className="text-3xl font-bold text-slate-900">Compress PDF</h1>
          <p className="text-slate-500">Reduce file size while maintaining quality.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {!file ? (
             <FileUploader 
                accept=".pdf" 
                onFilesSelected={handleFileSelected}
                description="Upload a PDF to compress"
            />
        ) : (
          <div className="space-y-8">
             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded text-red-600 font-bold text-sm">PDF</div>
                    <div>
                        <p className="font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
             
             <div className="grid md:grid-cols-3 gap-4">
               <button
                 onClick={() => setCompressionLevel('high')}
                 className={`p-4 rounded-xl border-2 text-left transition-all ${
                   compressionLevel === 'high' 
                     ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2' 
                     : 'border-slate-200 hover:border-indigo-300'
                 }`}
               >
                 <div className="font-bold text-slate-800 mb-1">Extreme</div>
                 <div className="text-xs text-slate-500">Low quality, smallest size</div>
               </button>
               
               <button
                 onClick={() => setCompressionLevel('medium')}
                 className={`p-4 rounded-xl border-2 text-left transition-all ${
                   compressionLevel === 'medium' 
                     ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2' 
                     : 'border-slate-200 hover:border-indigo-300'
                 }`}
               >
                 <div className="font-bold text-slate-800 mb-1">Recommended</div>
                 <div className="text-xs text-slate-500">Good quality, good compression</div>
               </button>
               
               <button
                 onClick={() => setCompressionLevel('low')}
                 className={`p-4 rounded-xl border-2 text-left transition-all ${
                   compressionLevel === 'low' 
                     ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2' 
                     : 'border-slate-200 hover:border-indigo-300'
                 }`}
               >
                 <div className="font-bold text-slate-800 mb-1">Less</div>
                 <div className="text-xs text-slate-500">High quality, larger size</div>
               </button>
             </div>

            <div className="flex justify-end">
              <Tooltip content="Compress and download PDF" position="top">
                <button
                  onClick={handleCompress}
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
                      <span>Compressing...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>Compress PDF</span>
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

export default CompressPdf;