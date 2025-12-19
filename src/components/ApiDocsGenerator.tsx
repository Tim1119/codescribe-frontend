import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import MarkdownPreview from './MarkdownPreview';
import ExportButtons from './ExportButtons';
import { Sparkles, Loader2, Server } from 'lucide-react';
import { API_URL } from '../config';

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  parameters: any[];
  responses: any;
}

const ApiDocsGenerator = () => {
  const [code, setCode] = useState<string>('');
  const [framework, setFramework] = useState<string>('FastAPI');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [documentation, setDocumentation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'docs'>('endpoints');

  const handleGenerate = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/api-docs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, framework })
      });

      if (!response.ok) throw new Error('Failed to generate API docs');

      const data = await response.json();
      setEndpoints(data.endpoints);
      setDocumentation(data.documentation);
    } catch (error) {
      console.error('Error generating API docs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'POST': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PUT': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">API Reference Builder</h1>
        <p className="text-slate-400">Generate OpenAPI-compatible documentation from your code.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-4">
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="FastAPI">FastAPI</option>
                <option value="Express">Express.js</option>
                <option value="Flask">Flask</option>
                <option value="Django">Django</option>
                <option value="Spring Boot">Spring Boot</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !code.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate Docs
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <CodeEditor
              value={code}
              onChange={(val) => setCode(val || '')}
              language={framework === 'FastAPI' || framework === 'Flask' || framework === 'Django' ? 'python' : 'javascript'}
              height="100%"
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-4 bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('endpoints')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'endpoints' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Endpoints
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'docs' ? 'text-white' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Documentation
              </button>
            </div>
            {documentation && <ExportButtons content={documentation} filename="api-docs.md" />}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
            {endpoints.length > 0 ? (
              activeTab === 'endpoints' ? (
                <div className="space-y-4">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                      <div className="flex items-center gap-3 p-3 border-b border-slate-700/50 bg-slate-800/50">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm text-slate-300 font-mono">{endpoint.path}</code>
                      </div>
                      <div className="p-4">
                        <p className="text-slate-400 text-sm mb-3">{endpoint.summary}</p>
                        {endpoint.parameters.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Parameters</h4>
                            <div className="grid gap-2">
                              {endpoint.parameters.map((param, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <span className="text-primary font-mono">{param.name}</span>
                                  <span className="text-slate-500 text-xs">({param.in})</span>
                                  <span className="text-slate-400">-</span>
                                  <span className="text-slate-400">{param.type}</span>
                                  {param.required && <span className="text-red-400 text-xs">*</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <MarkdownPreview content={documentation} />
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <Server size={48} className="mb-4" />
                <p>Generated API docs will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsGenerator;
