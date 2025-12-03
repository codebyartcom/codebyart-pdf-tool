import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Trash2, GripVertical, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import Tooltip from '../components/Tooltip';
import { PdfFile } from '../types';
import { mergePdfs } from '../services/pdfService';

const MergePdf: React.FC = () => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = (newFiles: PdfFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const mergedPdfBytes = await mergePdfs(files);
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. Please try again.');
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
          <h1 className="text-3xl font-bold text-slate-900">Merge PDF</h1>
          <p className="text-slate-500">Combine PDFs in the order you want.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <FileUploader 
          accept=".pdf" 
          multiple={true} 
          onFilesSelected={handleFilesSelected}
          description="Drag & drop PDFs here to start merging"
        />

        {files.length > 0 && (
          <div className="mt-8">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-700">Selected Files ({files.length})</h3>
                <Tooltip content="Remove all files" position="left">
                  <button 
                    onClick={() => setFiles([])}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear All
                  </button>
                </Tooltip>
             </div>
             
             <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pdf-list">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {files.map((file, index) => (
                      <Draggable key={file.id} draggableId={file.id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg group hover:border-indigo-300 transition-colors"
                          >
                            <div className="flex items-center space-x-3 overflow-hidden">
                              <Tooltip content="Drag to reorder">
                                <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing outline-none">
                                  <GripVertical size={20} />
                                </div>
                              </Tooltip>
                              <div className="w-10 h-12 bg-red-100 rounded flex items-center justify-center text-red-600 flex-shrink-0">
                                <span className="text-xs font-bold">PDF</span>
                              </div>
                              <div className="truncate">
                                <p className="font-medium text-slate-700 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <Tooltip content="Remove file" position="left">
                              <button
                                onClick={() => removeFile(file.id)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </Tooltip>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>

            <div className="mt-8 flex justify-end">
              <Tooltip content={files.length < 2 ? "Select at least 2 files" : "Combine files into one PDF"} position="top">
                <button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
                    ${files.length < 2 || isProcessing 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Merging...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>Merge PDF</span>
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

export default MergePdf;