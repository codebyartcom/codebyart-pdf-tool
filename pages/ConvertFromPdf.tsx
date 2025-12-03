import React, { useState } from 'react';
import { FileOutput, ArrowLeft, Download, Loader2, Image as ImageIcon, FileText, FileType } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import Tooltip from '../components/Tooltip';
import { PdfFile } from '../types';
import { pdfToImages, pdfToText } from '../services/pdfService';

type ConversionType = 'jpg' | 'png' | 'text' | 'word';

const ConvertFromPdf: React.FC = () => {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionType, setConversionType] = useState<ConversionType>('jpg');

  const handleFileSelected = (files: PdfFile[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      if (conversionType === 'jpg' || conversionType === 'png') {
          const zipBlob = await pdfToImages(file, conversionType === 'jpg' ? 'jpeg' : 'png');
          const url = URL.createObjectURL(zipBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${file.name}_images.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else if (conversionType === 'text') {
          const text = await pdfToText(file);
          const blob = new Blob([text], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${file.name}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else if (conversionType === 'word') {
          // Create a simple HTML-based DOC file that Word opens gracefully
          const text = await pdfToText(file);
          // Simple HTML wrapper
          const content = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Exported from CodeByArt PDF Tools</title></head>
            <body><pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${text}</pre></body></html>
          `;
          const blob = new Blob([content], { type: 'application/msword' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${file.name}.doc`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error converting PDF:', error);
      alert('Failed to convert PDF. Please try again.');
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
          <h1 className="text-3xl font-bold text-slate-900">Export PDF</h1>
          <p className="text-slate-500">Convert PDF to Images, Text, or Word (Text).</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {!file ? (
             <FileUploader 
                accept=".pdf" 
                onFilesSelected={handleFileSelected}
                description="Upload a PDF to convert"
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
             
             <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Select Output Format</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                        onClick={() => setConversionType('jpg')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${conversionType === 'jpg' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                        <ImageIcon size={24} className={conversionType === 'jpg' ? 'text-indigo-600' : 'text-slate-500'} />
                        <span className={`font-medium ${conversionType === 'jpg' ? 'text-indigo-700' : 'text-slate-600'}`}>JPG Images</span>
                    </button>

                    <button 
                        onClick={() => setConversionType('png')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${conversionType === 'png' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                        <ImageIcon size={24} className={conversionType === 'png' ? 'text-indigo-600' : 'text-slate-500'} />
                        <span className={`font-medium ${conversionType === 'png' ? 'text-indigo-700' : 'text-slate-600'}`}>PNG Images</span>
                    </button>

                    <button 
                        onClick={() => setConversionType('word')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${conversionType === 'word' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                        <FileType size={24} className={conversionType === 'word' ? 'text-indigo-600' : 'text-slate-500'} />
                        <span className={`font-medium ${conversionType === 'word' ? 'text-indigo-700' : 'text-slate-600'}`}>Word Doc</span>
                    </button>

                    <button 
                        onClick={() => setConversionType('text')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${conversionType === 'text' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                        <FileText size={24} className={conversionType === 'text' ? 'text-indigo-600' : 'text-slate-500'} />
                        <span className={`font-medium ${conversionType === 'text' ? 'text-indigo-700' : 'text-slate-600'}`}>Text File</span>
                    </button>
                </div>
                <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                    {conversionType === 'jpg' || conversionType === 'png' ? "Output will be a ZIP file containing images of each page." : 
                     conversionType === 'word' ? "Creates a .doc file containing the extracted text." : 
                     "Creates a plain .txt file with extracted text."}
                </p>
             </div>

            <div className="flex justify-end">
              <Tooltip content="Convert and download" position="top">
                <button
                  onClick={handleConvert}
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
                      <span>Converting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>Download Converted File</span>
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

export default ConvertFromPdf;