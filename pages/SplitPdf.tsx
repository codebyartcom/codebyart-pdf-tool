import React, { useState } from 'react';
import { Scissors, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import Tooltip from '../components/Tooltip';
import { PdfFile } from '../types';
import { splitPdf } from '../services/pdfService';
import { PDFDocument } from 'pdf-lib';

const SplitPdf: React.FC = () => {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = async (files: PdfFile[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      try {
        const ab = await f.file.arrayBuffer();
        const doc = await PDFDocument.load(ab);
        const count = doc.getPageCount();
        setMaxPages(count);
        setEndPage(count);
        setStartPage(1);
      } catch (e) {
        alert("Could not load PDF page count.");
      }
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    if (startPage < 1 || endPage > maxPages || startPage > endPage) {
        alert("Invalid page range");
        return;
    }

    setIsProcessing(true);
    try {
      const splitBytes = await splitPdf(file, startPage, endPage);
      const blob = new Blob([splitBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `split_${startPage}-${endPage}_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Failed to split PDF. Please try again.');
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
          <h1 className="text-3xl font-bold text-slate-900">Split PDF</h1>
          <p className="text-slate-500">Extract pages from your PDF document.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {!file ? (
             <FileUploader 
                accept=".pdf" 
                onFilesSelected={handleFileSelected}
                description="Upload a PDF to split"
            />
        ) : (
          <div className="space-y-6">
             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded text-red-600 font-bold text-sm">PDF</div>
                    <div>
                        <p className="font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{maxPages} pages total</p>
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
             
             <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-semibold text-slate-700">Select Page Range</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm text-slate-500 mb-1">From Page</label>
                        <input 
                            type="number" 
                            min="1" 
                            max={maxPages}
                            value={startPage}
                            onChange={(e) => setStartPage(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-slate-500 mb-1">To Page</label>
                        <input 
                            type="number" 
                            min="1" 
                            max={maxPages}
                            value={endPage}
                            onChange={(e) => setEndPage(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>
             </div>

            <div className="flex justify-end">
              <Tooltip content="Save extracted pages as new PDF" position="top">
                <button
                  onClick={handleSplit}
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
                      <span>Extract Pages</span>
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

export default SplitPdf;