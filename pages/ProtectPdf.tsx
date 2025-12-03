import React, { useState } from 'react';
import { Lock, ArrowLeft, Download, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import Tooltip from '../components/Tooltip';
import { PdfFile, PdfPermissions } from '../types';
import { protectPdf } from '../services/pdfService';

const ProtectPdf: React.FC = () => {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [permissions, setPermissions] = useState<PdfPermissions>({
    printing: false,
    copying: false,
    modifying: false
  });

  const handleFileSelected = (files: PdfFile[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleProtect = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    try {
      const bytes = await protectPdf(file, password, permissions);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protected_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error protecting PDF:', error);
      alert('Failed to protect PDF. Please try again.');
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
          <h1 className="text-3xl font-bold text-slate-900">Protect PDF</h1>
          <p className="text-slate-500">Encrypt your PDF and restrict permissions.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {!file ? (
             <FileUploader 
                accept=".pdf" 
                onFilesSelected={handleFileSelected}
                description="Upload a PDF to protect"
            />
        ) : (
          <div className="space-y-6">
             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded text-red-600 font-bold text-sm">PDF</div>
                    <div>
                        <p className="font-medium text-slate-800">{file.name}</p>
                    </div>
                </div>
                <Tooltip content="Select a different PDF" position="left">
                  <button 
                    onClick={() => { setFile(null); setPassword(''); }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Change File
                  </button>
                </Tooltip>
             </div>
             
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-800">1. Set Password</h3>
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="block text-sm text-slate-500 mb-2">User Password (Required)</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter strong password"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <Tooltip content={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-3">
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-400 hover:text-slate-600 outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                            </Tooltip>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            The file cannot be opened without this password.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                     <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                         2. Permissions
                         <ShieldCheck size={16} className="text-indigo-600" />
                     </h3>
                     <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                         <p className="text-xs text-slate-500 mb-2">Uncheck to restrict these actions:</p>
                         
                         <label className="flex items-center space-x-3 cursor-pointer">
                             <input 
                                type="checkbox" 
                                checked={permissions.printing} 
                                onChange={(e) => setPermissions(p => ({...p, printing: e.target.checked}))}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                             />
                             <span className="text-sm font-medium text-slate-700">Allow Printing</span>
                         </label>

                         <label className="flex items-center space-x-3 cursor-pointer">
                             <input 
                                type="checkbox" 
                                checked={permissions.copying} 
                                onChange={(e) => setPermissions(p => ({...p, copying: e.target.checked}))}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                             />
                             <span className="text-sm font-medium text-slate-700">Allow Copying Text</span>
                         </label>

                         <label className="flex items-center space-x-3 cursor-pointer">
                             <input 
                                type="checkbox" 
                                checked={permissions.modifying} 
                                onChange={(e) => setPermissions(p => ({...p, modifying: e.target.checked}))}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                             />
                             <span className="text-sm font-medium text-slate-700">Allow Editing/Modifying</span>
                         </label>
                     </div>
                </div>
             </div>

            <div className="flex justify-end pt-4">
              <Tooltip content="Encrypt and save PDF" position="top">
                <button
                  onClick={handleProtect}
                  disabled={!password || isProcessing}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
                    ${!password || isProcessing 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Encrypting...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      <span>Protect PDF</span>
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

export default ProtectPdf;