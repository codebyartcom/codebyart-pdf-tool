export enum ToolType {
  MERGE = 'MERGE',
  IMG_TO_PDF = 'IMG_TO_PDF',
  SPLIT = 'SPLIT',
  ROTATE = 'ROTATE',
  PROTECT = 'PROTECT',
  COMPRESS = 'COMPRESS',
  EDIT = 'EDIT',
  WATERMARK = 'WATERMARK',
  CONVERT_FROM = 'CONVERT_FROM',
  CONVERT_TO = 'CONVERT_TO'
}

export interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingAnnotation {
  id: string;
  type: 'drawing';
  page: number;
  points: Point[];
  color: string;
  width: number;
}

export interface TextAnnotation {
  id: string;
  type: 'text';
  page: number;
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
}

export interface RectangleAnnotation {
  id: string;
  type: 'rectangle';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string; // Fill color
}

export type Annotation = DrawingAnnotation | TextAnnotation | RectangleAnnotation;

export interface PdfPermissions {
  printing: boolean;
  modifying: boolean;
  copying: boolean;
}