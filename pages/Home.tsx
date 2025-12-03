import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Image, ArrowRight, Zap, Shield, Globe, Scissors, RotateCw, Lock, Minimize2, Edit3, Type, FileOutput, FileInput } from 'lucide-react';

const ToolCard = ({ icon: Icon, title, description, to, color }: any) => (
  <Link 
    to={to} 
    className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
  >
    <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="text-white" size={28} />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 mb-4 flex-grow">{description}</p>
    <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700 mt-auto">
      Use Tool <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

const Home: React.FC = () => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          CodeByArt <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">PDF Tools</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          The ultimate suite of PDF tools. Convert, edit, merge, split, and protect your documents directly in your browser. No uploads, no waiting, 100% secure.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link to="/convert-from" className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30">
            Convert PDF
          </Link>
          <Link to="/edit" className="px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-full font-semibold hover:bg-indigo-50 transition">
            Edit & Sign
          </Link>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ToolCard 
          icon={Image} 
          title="Image to PDF" 
          description="Convert JPG, PNG images into a single PDF."
          to="/img-to-pdf"
          color="bg-orange-500"
        />
        <ToolCard 
          icon={FileOutput} 
          title="Export PDF" 
          description="Convert PDF to JPG, PNG, Text, or Word formats."
          to="/convert-from"
          color="bg-rose-500"
        />
        <ToolCard 
          icon={FileInput} 
          title="Create PDF" 
          description="Create PDFs from Text or Markdown."
          to="/convert-to"
          color="bg-cyan-600"
        />
        <ToolCard 
          icon={Edit3} 
          title="Edit & View" 
          description="View PDFs, fill forms, sign documents, and add annotations."
          to="/edit"
          color="bg-violet-500"
        />
        <ToolCard 
          icon={Layers} 
          title="Merge PDF" 
          description="Combine multiple PDF documents into a single file."
          to="/merge"
          color="bg-blue-500"
        />
        <ToolCard 
          icon={Minimize2} 
          title="Compress PDF" 
          description="Reduce PDF file size while maintaining quality."
          to="/compress"
          color="bg-pink-500"
        />
        <ToolCard 
          icon={Scissors} 
          title="Split PDF" 
          description="Extract specific pages or ranges from your PDF document."
          to="/split"
          color="bg-red-500"
        />
        <ToolCard 
          icon={RotateCw} 
          title="Rotate PDF" 
          description="Rotate PDF pages securely. Fix scanned documents."
          to="/rotate"
          color="bg-green-500"
        />
        <ToolCard 
          icon={Type} 
          title="Add Watermark" 
          description="Overlay text watermarks to protect your documents."
          to="/watermark"
          color="bg-teal-500"
        />
        <ToolCard 
          icon={Lock} 
          title="Protect PDF" 
          description="Encrypt your PDF with a password to restrict access."
          to="/protect"
          color="bg-slate-700"
        />
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 border-t border-slate-200 pt-16">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Zap size={24} />
          </div>
          <h4 className="font-bold text-slate-900">Instant Processing</h4>
          <p className="text-sm text-slate-500">Everything happens in your browser. No server uploads required.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Shield size={24} />
          </div>
          <h4 className="font-bold text-slate-900">100% Private</h4>
          <p className="text-sm text-slate-500">Your sensitive documents never leave your device.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <Globe size={24} />
          </div>
          <h4 className="font-bold text-slate-900">Works Offline</h4>
          <p className="text-sm text-slate-500">Once loaded, you can use these tools without an internet connection.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;