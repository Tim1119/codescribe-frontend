import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import ExportButtons from './ExportButtons';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { API_URL } from '../config';

const DocumentationGenerator = () => {
  const [code, setCode] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('python');
  const [style, setStyle] = useState<string>('Google');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/documentation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          style,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate documentation');
      }

      const data = await response.json();
      setGeneratedCode(data.documented_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Smart Code Documentation</h1>
        <p className="text-slate-400">Automatically generate comprehensive documentation for your code.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Google">Google Style</option>
                <option value="NumPy">NumPy Style</option>
                <option value="Sphinx">Sphinx Style</option>
                <option value="JSDoc">JSDoc</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !code.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <CodeEditor
              value={code}
              onChange={(val) => setCode(val || '')}
              language={language}
              height="100%"
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700 h-[72px]">
            <h2 className="font-semibold text-slate-200">Generated Documentation</h2>
            {generatedCode && <ExportButtons content={generatedCode} filename={`documented_code.${language === 'python' ? 'py' : 'js'}`} />}
          </div>

          <div className="flex-1 min-h-0 relative">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-lg border border-red-500/20">
                <p className="text-red-400">{error}</p>
              </div>
            ) : generatedCode ? (
              <CodeEditor
                value={generatedCode}
                onChange={() => {}}
                language={language}
                readOnly={true}
                height="100%"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border border-slate-800 text-slate-500">
                <ArrowRight size={48} className="mb-4 opacity-20" />
                <p>Generated code will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationGenerator;
