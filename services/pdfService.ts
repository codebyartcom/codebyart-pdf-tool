import { PDFDocument, degrees, rgb, grayscale } from 'pdf-lib';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { PdfFile, Annotation, PdfPermissions } from '../types';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

// Helper to parse hex color to rgb (0-1 range for pdf-lib)
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

export const mergePdfs = async (files: PdfFile[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();

  for (const pdfFile of files) {
    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
};

export const splitPdf = async (file: PdfFile, startPage: number, endPage: number): Promise<Uint8Array> => {
  const arrayBuffer = await file.file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  
  // Page indices are 0-based, user input is 1-based
  const totalPages = srcPdf.getPageCount();
  const start = Math.max(0, startPage - 1);
  const end = Math.min(totalPages - 1, endPage - 1);

  if (start > end) {
      throw new Error("Invalid page range");
  }

  const range = [];
  for (let i = start; i <= end; i++) {
      range.push(i);
  }

  const copiedPages = await newPdf.copyPages(srcPdf, range);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
};

export const rotatePdf = async (file: PdfFile, rotation: 90 | 180 | 270 | 0): Promise<Uint8Array> => {
    const arrayBuffer = await file.file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();
    
    pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
    });

    return await pdf.save();
};

export const protectPdf = async (file: PdfFile, password: string, permissions: PdfPermissions): Promise<Uint8Array> => {
    const arrayBuffer = await file.file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    
    pdf.encrypt({
        userPassword: password,
        ownerPassword: password,
        permissions: {
            printing: permissions.printing ? 'highResolution' : undefined,
            modifying: permissions.modifying,
            copying: permissions.copying,
            annotating: permissions.modifying,
            fillingForms: permissions.modifying,
            contentAccessibility: permissions.copying, 
            documentAssembly: permissions.modifying,
        },
    });

    return await pdf.save();
};

export const compressPdf = async (file: PdfFile, quality: number = 0.5, scale: number = 1.0): Promise<Blob> => {
  const arrayBuffer = await file.file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error("Could not create canvas context");

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    if (i > 1) doc.addPage();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const widthRatio = pageWidth / viewport.width;
    const heightRatio = pageHeight / viewport.height;
    const ratio = Math.min(widthRatio, heightRatio);
    
    const w = viewport.width * ratio;
    const h = viewport.height * ratio;
    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;
    
    doc.addImage(imgData, 'JPEG', x, y, w, h);
  }

  return doc.output('blob');
};

export const imagesToPdf = async (files: PdfFile[]): Promise<Blob> => {
  const doc = new jsPDF();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imgData = await readFileAsDataURL(file.file);
    const imgProps = await getImageProperties(imgData);
    
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    
    const widthRatio = pdfWidth / imgProps.width;
    const heightRatio = pdfHeight / imgProps.height;
    const ratio = Math.min(widthRatio, heightRatio);
    
    const w = imgProps.width * ratio;
    const h = imgProps.height * ratio;
    
    const x = (pdfWidth - w) / 2;
    const y = (pdfHeight - h) / 2;

    if (i > 0) doc.addPage();
    
    // Detect format
    const format = file.file.type === 'image/png' ? 'PNG' : 'JPEG';
    doc.addImage(imgData, format, x, y, w, h);
  }
  return doc.output('blob');
};

export const textToPdf = async (text: string): Promise<Blob> => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180); // Margin 15mm left/right approx
    let y = 15;
    const pageHeight = doc.internal.pageSize.height;

    for(let i = 0; i < splitText.length; i++) {
        if (y > pageHeight - 15) {
            doc.addPage();
            y = 15;
        }
        doc.text(splitText[i], 15, y);
        y += 7;
    }
    return doc.output('blob');
};

export const pdfToImages = async (file: PdfFile, format: 'jpeg' | 'png' = 'jpeg'): Promise<Blob> => {
    const arrayBuffer = await file.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const zip = new JSZip();

    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) throw new Error("Canvas context failed");

        await page.render({ canvasContext: context, viewport }).promise;
        
        const dataUrl = canvas.toDataURL(`image/${format}`, 0.9);
        const base64Data = dataUrl.split(',')[1];
        
        zip.file(`page_${i}.${format}`, base64Data, { base64: true });
    }

    return await zip.generateAsync({ type: 'blob' });
};

export const pdfToText = async (file: PdfFile): Promise<string> => {
    const arrayBuffer = await file.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText;
};

export const modifyPdf = async (file: PdfFile, annotations: Annotation[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  for (const ann of annotations) {
    const pageIndex = ann.page - 1; 
    if (pageIndex < 0 || pageIndex >= pages.length) continue;
    
    const page = pages[pageIndex];
    const { height } = page.getSize();
    
    if (ann.type === 'text') {
      page.drawText(ann.text, {
        x: ann.x,
        y: height - ann.y, 
        size: ann.size,
        color: hexToRgb(ann.color),
      });
    } else if (ann.type === 'drawing') {
      if (ann.points.length > 1) {
        for (let i = 0; i < ann.points.length - 1; i++) {
          const p1 = ann.points[i];
          const p2 = ann.points[i + 1];
          page.drawLine({
            start: { x: p1.x, y: height - p1.y },
            end: { x: p2.x, y: height - p2.y },
            thickness: ann.width,
            color: hexToRgb(ann.color),
          });
        }
      }
    } else if (ann.type === 'rectangle') {
        page.drawRectangle({
            x: ann.x,
            y: height - ann.y - ann.height, // PDF y is bottom-left, rect y is top-left
            width: ann.width,
            height: ann.height,
            color: hexToRgb(ann.color),
            opacity: 1,
        });
    }
  }

  return await pdfDoc.save();
};

export const addWatermark = async (file: PdfFile, text: string, opacity: number, color: string, size: number): Promise<Uint8Array> => {
    const arrayBuffer = await file.file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const rgbColor = hexToRgb(color);

    pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(text, {
            x: width / 2 - (text.length * size) / 4, // Rough centering
            y: height / 2,
            size: size,
            color: rgbColor,
            opacity: opacity,
            rotate: degrees(45),
        });
    });

    return await pdfDoc.save();
};

// Helper to read file as Data URL
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to get image dimensions
const getImageProperties = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); 
    };
    reader.readAsDataURL(blob);
  });
};