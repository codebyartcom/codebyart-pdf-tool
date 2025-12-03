import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Trash2, GripVertical, Download, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import Tooltip from '../components/Tooltip';
import { PdfFile } from '../types';
import { imagesToPdf } from '../services/pdfService';

const ImageToPdf: React.FC = () => {
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const blob = await imagesToPdf(files);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `images_converted_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error converting images:', error);
      alert('Failed to convert images. Please try again.');
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
          <h1 className="text-3xl font-bold text-slate-900">Image to PDF</h1>
          <p className="text-slate-500">Convert your photos to a professional PDF document.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <FileUploader 
          accept="image/*" 
          multiple={true} 
          onFilesSelected={handleFilesSelected}
          description="Drag & drop images (JPG, PNG)"
        />

        {files.length > 0 && (
          <div className="mt-8">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-700">Selected Images ({files.length})</h3>
                <Tooltip content="Remove all images" position="left">
                  <button 
                    onClick={() => setFiles([])}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear All
                  </button>
                </Tooltip>
             </div>
             
             <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="img-list" direction="horizontal">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {files.map((file, index) => (
                      <Draggable key={file.id} draggableId={file.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="relative group bg-slate-50 border border-slate-200 rounded-lg p-2 aspect-square flex flex-col items-center justify-center hover:border-indigo-300 transition-colors"
                          >
                             <Tooltip content="Drag to reorder" className="absolute top-2 left-2 z-10">
                               <div {...provided.dragHandleProps} className="bg-white/80 p-1 rounded cursor-grab outline-none">
                                  <GripVertical size={16} className="text-slate-600" />
                               </div>
                             </Tooltip>
                             <Tooltip content="Remove image" className="absolute top-2 right-2 z-10">
                               <button
                                onClick={() => removeFile(file.id)}
                                className="bg-white/80 p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                             </Tooltip>
                            {file.previewUrl ? (
                                <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover rounded" />
                            ) : (
                                <ImageIcon className="text-slate-300 w-12 h-12" />
                            )}
                            <p className="absolute bottom-0 left-0 right-0 bg-white/90 p-1 text-xs text-center truncate rounded-b">
                                {file.name}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div className="mt-8 flex justify-end">
              <Tooltip content="Create PDF from images" position="top">
                <button
                  onClick={handleConvert}
                  disabled={files.length === 0 || isProcessing}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
                    ${files.length === 0 || isProcessing 
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
                      <span>Convert to PDF</span>
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

export default ImageToPdf;