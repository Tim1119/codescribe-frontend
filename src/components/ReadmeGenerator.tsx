import  { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Sparkles, Loader2 } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';
import ExportButtons from './ExportButtons';
import { API_URL } from '../config';

interface FileContent {
  name: string;
  content: string;
  size: number;
}

const ReadmeGenerator = () => {
  const [files, setFiles] = useState<FileContent[]>([]);
  const [generatedReadme, setGeneratedReadme] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [template, setTemplate] = useState('Standard');
  const [sections, setSections] = useState<string[]>([
    'Installation', 'Usage', 'Features', 'Contributing', 'License'
  ]);

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
      const response = await fetch(`${API_URL}/api/readme/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map(f => ({ name: f.name, content: f.content })),
          sections,
          template
        })
      });

      if (!response.ok) throw new Error('Failed to generate README');

      const data = await response.json();
      setGeneratedReadme(data.readme);
    } catch (error) {
      console.error('Error generating README:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const availableSections = [
    'Installation', 'Usage', 'Features', 'API Reference', 
    'Configuration', 'Contributing', 'License', 'Credits'
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">README Generator</h1>
        <p className="text-slate-400">Upload your project files to generate a comprehensive README.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="flex flex-col gap-6">
          {/* File Upload */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-slate-700 hover:border-primary/50 hover:bg-slate-800/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-4 text-slate-400" size={32} />
            <p className="text-slate-300 font-medium mb-1">Drop project files here</p>
            <p className="text-slate-500 text-sm">or click to browse (code files, package.json, etc.)</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Uploaded Files ({files.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <File size={16} className="text-primary flex-shrink-0" />
                      <span className="text-sm text-slate-300 truncate">{file.name}</span>
                      <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
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

          {/* Configuration */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Template Style</label>
              <select 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Minimal">Minimal</option>
                <option value="Standard">Standard</option>
                <option value="Detailed">Detailed</option>
                <option value="Open Source">Open Source</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Include Sections</label>
              <div className="grid grid-cols-2 gap-3">
                {availableSections.map(section => (
                  <label key={section} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      sections.includes(section) 
                        ? 'bg-primary border-primary' 
                        : 'border-slate-600 group-hover:border-slate-500'
                    }`}>
                      {sections.includes(section) && <Sparkles size={10} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={sections.includes(section)}
                      onChange={() => toggleSection(section)}
                    />
                    <span className={`text-sm ${sections.includes(section) ? 'text-white' : 'text-slate-400'}`}>
                      {section}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || files.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate README
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col h-full min-h-[500px] bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
            <h2 className="font-semibold text-slate-200">Preview</h2>
            {generatedReadme && <ExportButtons content={generatedReadme} filename="README.md" />}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
            {generatedReadme ? (
              <MarkdownPreview content={generatedReadme} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <File size={48} className="mb-4" />
                <p>Generated README will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadmeGenerator;
