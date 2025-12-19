import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Sparkles, Loader2, GitGraph, ZoomIn, ZoomOut } from 'lucide-react';
import mermaid from 'mermaid';
import ExportButtons from './ExportButtons';
import { API_URL } from '../config';

interface FileContent {
  name: string;
  content: string;
  size: number;
}

const ArchitectureDiagram = () => {
  const [files, setFiles] = useState<FileContent[]>([]);
  const [diagramType, setDiagramType] = useState('Flowchart');
  const [mermaidCode, setMermaidCode] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    if (mermaidCode) {
      try {
        mermaid.contentLoaded();
        const element = document.getElementById('mermaid-diagram');
        if (element) {
          element.removeAttribute('data-processed');
          mermaid.run({
            nodes: [element],
          });
        }
      } catch (e) {
        console.error('Mermaid error:', e);
      }
    }
  }, [mermaidCode]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setFiles(prev => [...prev, {
          name: file.name,
          content,
          size: file.size
        }]);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/diagrams/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map(f => ({ name: f.name, content: f.content })),
          diagram_type: diagramType
        })
      });

      if (!response.ok) throw new Error('Failed to generate diagram');

      const data = await response.json();
      setMermaidCode(data.mermaid_code);
      setDescription(data.description);
    } catch (error) {
      console.error('Error generating diagram:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Architecture Diagram Generator</h1>
        <p className="text-slate-400">Visualize your codebase structure with AI-generated diagrams.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Input Section */}
        <div className="flex flex-col gap-6">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-slate-700 hover:border-primary/50 hover:bg-slate-800/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-4 text-slate-400" size={32} />
            <p className="text-slate-300 font-medium mb-1">Drop source files here</p>
            <p className="text-slate-500 text-sm">or click to browse</p>
          </div>

          {files.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Uploaded Files ({files.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <File size={16} className="text-primary flex-shrink-0" />
                      <span className="text-sm text-slate-300 truncate">{file.name}</span>
                    </div>
                    <button 
                      onClick={() => removeFile(index)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Diagram Type</label>
              <select 
                value={diagramType}
                onChange={(e) => setDiagramType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Flowchart">Flowchart</option>
                <option value="Class Diagram">Class Diagram</option>
                <option value="Sequence Diagram">Sequence Diagram</option>
                <option value="ER Diagram">ER Diagram</option>
                <option value="State Diagram">State Diagram</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || files.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate Diagram
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-4 bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
            <h2 className="font-semibold text-slate-200">Preview</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                <ZoomOut size={18} />
              </button>
              <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                <ZoomIn size={18} />
              </button>
              {mermaidCode && <ExportButtons content={mermaidCode} filename="diagram.mmd" />}
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-slate-900 relative flex items-center justify-center p-4">
            {mermaidCode ? (
              <div 
                className="overflow-auto w-full h-full flex items-center justify-center"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              >
                <div id="mermaid-diagram" className="mermaid">
                  {mermaidCode}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 opacity-50">
                <GitGraph size={48} className="mb-4" />
                <p>Diagram will appear here</p>
              </div>
            )}
          </div>
          
          {description && (
            <div className="p-4 border-t border-slate-700 bg-slate-900/50 text-sm text-slate-300">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
