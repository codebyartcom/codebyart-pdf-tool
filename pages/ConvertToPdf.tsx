import React, { useState } from 'react';
import { FileInput, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tooltip from '../components/Tooltip';
import { textToPdf } from '../services/pdfService';

const ConvertToPdf: React.FC = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTextUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setText(ev.target?.result as string);
          reader.readAsText(file);
      }
  };

  const handleConvert = async () => {
    if (!text) return;
    setIsProcessing(true);
    try {
      const blob = await textToPdf(text);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted_text.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error converting text:', error);
      alert('Failed to convert. Please try again.');
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
          <h1 className="text-3xl font-bold text-slate-900">Create PDF</h1>
          <p className="text-slate-500">Convert Text or Images into PDF documents.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
          {/* Text to PDF Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                      <FileInput size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Text to PDF</h2>
              </div>

              <div className="space-y-4 flex-grow">
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your text here..."
                    className="w-full h-48 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  ></textarea>
                  
                  <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">OR</span>
                      <label className="cursor-pointer px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition">
                          Upload .txt File
                          <input type="file" accept=".txt,.md" className="hidden" onChange={handleTextUpload} />
                      </label>
                  </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                    onClick={handleConvert}
                    disabled={!text || isProcessing}
                    className={`
                        flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all w-full justify-center
                        ${!text || isProcessing 
                        ? 'bg-slate-300 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
                        }
                    `}
                >
                    {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                    <span>Convert Text to PDF</span>
                </button>
              </div>
          </div>

          {/* Image to PDF Link Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
              <div>
                  <h2 className="text-2xl font-bold mb-2">Image to PDF</h2>
                  <p className="text-indigo-100 mb-6">Convert JPG, PNG photos into a single PDF document.</p>
                  <ul className="space-y-2 text-sm text-indigo-50">
                      <li className="flex items-center gap-2">✓ Support for multiple images</li>
                      <li className="flex items-center gap-2">✓ Drag & Drop interface</li>
                      <li className="flex items-center gap-2">✓ Auto-sizing</li>
                  </ul>
              </div>
              
              <Link to="/img-to-pdf" className="mt-8 bg-white text-indigo-600 py-3 px-6 rounded-xl font-bold text-center hover:bg-indigo-50 transition shadow-lg">
                  Go to Image Converter
              </Link>
          </div>
      </div>
    </div>
  );
};

export default ConvertToPdf;