import React, { useCallback, useState } from 'react';
import { Upload, FileType, X } from 'lucide-react';
import { PdfFile } from '../types';

interface FileUploaderProps {
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: PdfFile[]) => void;
  description?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ accept, multiple = false, onFilesSelected, description }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: PdfFile[] = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    onFilesSelected(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }
      `}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
          <Upload size={32} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {isDragging ? 'Drop files here' : 'Click or Drag & Drop'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {description || `Supported formats: ${accept}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
