# CodeByArt PDF Tools

A comprehensive, 100% client-side PDF manipulation suite built with React. This application allows users to merge, split, rotate, convert, and protect PDF documents directly in the browser without uploading files to a server, ensuring maximum privacy and security.

## Features

- **Organize**:
  - **Merge PDF**: Combine multiple PDF files into one.
  - **Split PDF**: Extract specific page ranges.
  - **Rotate PDF**: Rotate pages securely.
  - **Compress PDF**: Reduce file size with adjustable quality settings.

- **Convert**:
  - **Image to PDF**: Convert JPG and PNG images into a single PDF.
  - **Export PDF**: Convert PDF pages to Images (JPG/PNG), Text, or Word (.doc).
  - **Create PDF**: Generate PDFs from plain text.

- **Edit & Security**:
  - **Edit & Sign**: View PDFs, add text, draw signatures, and redact content.
  - **Watermark**: Add customizable text watermarks to pages.
  - **Protect PDF**: Encrypt documents with passwords and restrict permissions (printing, copying, etc.).

## Tech Stack

- **Framework**: React 19 (via ESM imports)
- **Styling**: Tailwind CSS
- **PDF Core**: 
  - `pdf-lib` (Modification, Merging, Rotation)
  - `jspdf` (Generation from Images/Text)
  - `pdfjs-dist` (Rendering & Text Extraction)
- **Icons**: Lucide React
- **Drag & Drop**: @hello-pangea/dnd

## Setup & Usage

Since this project uses ES Modules and an Import Map (no build step required like Webpack or Vite), you can run it using any static file server.

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codebyart-pdf-tools.git
   cd codebyart-pdf-tools
   ```

2. **Run a static server**
   You can use Python, `http-server`, or the Live Server extension in VS Code.

   *Using Python:*
   ```bash
   python3 -m http.server 8000
   ```

   *Using Node http-server:*
   ```bash
   npx http-server
   ```

3. **Open in Browser**
   Navigate to `http://localhost:8000` (or the port shown in your terminal).

## Privacy

This application is designed with a "Privacy First" approach. All PDF processing happens locally within the user's browser using WebAssembly and JavaScript libraries. **No files are ever uploaded to a backend server.**

## License

MIT
