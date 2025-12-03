import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MergePdf from './pages/MergePdf';
import ImageToPdf from './pages/ImageToPdf';
import SplitPdf from './pages/SplitPdf';
import RotatePdf from './pages/RotatePdf';
import ProtectPdf from './pages/ProtectPdf';
import CompressPdf from './pages/CompressPdf';
import PdfEditor from './pages/PdfEditor';
import WatermarkPdf from './pages/WatermarkPdf';
import ConvertFromPdf from './pages/ConvertFromPdf';
import ConvertToPdf from './pages/ConvertToPdf';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/edit" element={<PdfEditor />} />
          <Route path="/merge" element={<MergePdf />} />
          <Route path="/split" element={<SplitPdf />} />
          <Route path="/rotate" element={<RotatePdf />} />
          <Route path="/compress" element={<CompressPdf />} />
          <Route path="/img-to-pdf" element={<ImageToPdf />} />
          <Route path="/protect" element={<ProtectPdf />} />
          <Route path="/watermark" element={<WatermarkPdf />} />
          <Route path="/convert-from" element={<ConvertFromPdf />} />
          <Route path="/convert-to" element={<ConvertToPdf />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;