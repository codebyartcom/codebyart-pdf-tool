import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, Image, Layers, Scissors, RotateCw, Lock, Github, Instagram, Minimize2, Edit3, ChevronDown, Type, FileOutput, FileInput } from 'lucide-react';
import Tooltip from './Tooltip';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  const toolGroups = {
    Organize: [
      { name: 'Merge PDF', path: '/merge', icon: Layers, tooltip: 'Combine multiple PDFs' },
      { name: 'Split PDF', path: '/split', icon: Scissors, tooltip: 'Extract pages' },
      { name: 'Rotate PDF', path: '/rotate', icon: RotateCw, tooltip: 'Rotate pages' },
      { name: 'Compress PDF', path: '/compress', icon: Minimize2, tooltip: 'Reduce size' },
    ],
    Convert: [
      { name: 'Export PDF', path: '/convert-from', icon: FileOutput, tooltip: 'PDF to Image/Word/Text' },
      { name: 'Create PDF', path: '/convert-to', icon: FileInput, tooltip: 'Text/Image to PDF' },
      { name: 'Image to PDF', path: '/img-to-pdf', icon: Image, tooltip: 'Convert images' },
    ],
    Edit: [
       { name: 'Edit & Sign', path: '/edit', icon: Edit3, tooltip: 'View, Sign & Annotate' },
       { name: 'Watermark', path: '/watermark', icon: Type, tooltip: 'Add Watermark' },
    ],
    Security: [
      { name: 'Protect PDF', path: '/protect', icon: Lock, tooltip: 'Add Password & Permissions' },
    ]
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-2 rounded-lg">
                  <FileText size={24} />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 hidden xs:block">
                  CodeByArt PDF Tools
                </span>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 block xs:hidden">
                  CodeByArt
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:bg-slate-100'}`}>
                Home
              </Link>

              {Object.entries(toolGroups).map(([groupName, tools]) => (
                <div 
                  key={groupName}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(groupName)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                   <button className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none">
                      <span>{groupName}</span>
                      <ChevronDown size={14} />
                   </button>
                   
                   {/* Dropdown */}
                   <div className={`absolute top-full left-0 w-60 pt-2 transition-all duration-200 ${activeDropdown === groupName ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                      <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                        {tools.map(tool => (
                           <Link
                             key={tool.path}
                             to={tool.path}
                             className={`flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors ${isActive(tool.path) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}
                           >
                             <div className={`p-1.5 rounded-lg ${isActive(tool.path) ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-white'}`}>
                               <tool.icon size={16} />
                             </div>
                             <span className="text-sm font-medium">{tool.name}</span>
                           </Link>
                        ))}
                      </div>
                   </div>
                </div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 overflow-y-auto max-h-[85vh] shadow-lg absolute w-full left-0 top-16 z-40">
            <div className="px-4 py-4 space-y-6">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-lg font-bold text-slate-800 bg-slate-50 rounded-lg"
              >
                Home
              </Link>
              {Object.entries(toolGroups).map(([groupName, tools]) => (
                <div key={groupName} className="space-y-2">
                  <div className="px-3 text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                    {groupName}
                    <div className="h-px bg-indigo-100 flex-grow"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tools.map((item) => (
                        <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive(item.path)
                            ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                            : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
                        }`}
                        >
                        <div className={`p-2 rounded-md ${isActive(item.path) ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                            <item.icon size={18} />
                        </div>
                        <span>{item.name}</span>
                        </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-slate-500 text-sm">
              <span className="font-semibold">&copy; {new Date().getFullYear()} Codebyart.</span>
              <span>All rights reserved.</span>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-1 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                 <span>Designed by</span>
                 <Tooltip content="Visit Techiekamal21 on GitHub" position="top">
                   <a href="https://github.com/Techiekamal21" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1">
                      <Github size={14} />
                      <span>Techiekamal21</span>
                   </a>
                 </Tooltip>
              </div>
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <Instagram size={12} />
                <span>techiekamal</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;