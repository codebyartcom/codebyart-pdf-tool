# CodeByArt PDF Tools

A comprehensive, 100% client-side PDF manipulation suite built with React. This application allows users to merge, split, rotate, convert, and protect PDF documents directly in the browser without uploading files to a server, ensuring maximum privacy and security.

## Live Demo

🚀 **[Try it now on GitHub Pages](https://codebyartcom.github.io/codebyart-pdf-tool/)**

The application is deployed and ready to use. All processing happens in your browser - no server uploads required.

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
   git clone https://github.com/codebyartcom/codebyart-pdf-tool.git
   cd codebyart-pdf-tool
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

## Deployment

### GitHub Pages Configuration

This application is configured for deployment to GitHub Pages with the following settings:

- **Base Path**: `/codebyart-pdf-tool/` (configured in `vite.config.ts`)
- **Repository**: The base path must match your GitHub repository name
- **Router**: Uses HashRouter for client-side routing (no server configuration needed)

### Building for Production

To build the application for deployment:

```bash
npm install
npm run build
```

This generates an optimized production build in the `dist/` folder with all asset references correctly prefixed with the base path.

### Deploying to GitHub Pages

1. Build the application (see above)
2. Commit the changes to your repository
3. Push to GitHub
4. Configure GitHub Pages in repository settings to serve from your chosen branch/folder
5. Access your site at `https://codebyartcom.github.io/codebyart-pdf-tool/`

For detailed deployment instructions, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md).

### Base Path Configuration

The base path is critical for GitHub Pages deployment. It's configured in `vite.config.ts`:

```typescript
export default defineConfig(({ mode }) => {
  return {
    base: '/codebyart-pdf-tool/', // Must match repository name
    // ... other config
  };
});
```

**Important**: If you fork this repository or change the repository name, update the `base` property in `vite.config.ts` to match your new repository name: `/your-repo-name/`

## Privacy

This application is designed with a "Privacy First" approach. All PDF processing happens locally within the user's browser using WebAssembly and JavaScript libraries. **No files are ever uploaded to a backend server.**

## License

MIT
