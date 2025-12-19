import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import MarkdownPreview from './MarkdownPreview';
import { Sparkles, Loader2, BookOpen, Lightbulb, Target } from 'lucide-react';
import { API_URL } from '../config';

interface Explanation {
  explanation: string;
  key_concepts: string[];
  analogies: string[];
}

const CodeExplainer = () => {
  const [code, setCode] = useState<string>('');
  const [level, setLevel] = useState<string>('Junior developer');
  const [focusArea, setFocusArea] = useState<string>('');
  const [result, setResult] = useState<Explanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/explainer/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, level, focus_area: focusArea || undefined })
      });

      if (!response.ok) throw new Error('Failed to explain code');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error explaining code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Code Explainer</h1>
        <p className="text-slate-400">Get clear explanations for complex code snippets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Audience Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="5-year-old">5-year-old (Simple Analogies)</option>
                  <option value="Non-technical stakeholder">Non-technical Stakeholder</option>
                  <option value="Junior developer">Junior Developer</option>
                  <option value="Senior developer">Senior Developer</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Focus Area (Optional)</label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g., Performance, Security"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button
              onClick={handleExplain}
              disabled={isLoading || !code.trim()}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Explain Code
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <CodeEditor
              value={code}
              onChange={(val) => setCode(val || '')}
              language="python"
              height="100%"
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-4 bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50">
            <h2 className="font-semibold text-slate-200">Explanation</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
            {result ? (
              <div className="space-y-6">
                <div className="prose prose-invert max-w-none">
                  <MarkdownPreview content={result.explanation} />
                </div>

                {result.key_concepts.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-3 text-primary">
                      <BookOpen size={18} />
                      <h3 className="font-semibold">Key Concepts</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {result.key_concepts.map((concept, i) => (
                        <li key={i}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.analogies.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-3 text-secondary">
                      <Lightbulb size={18} />
                      <h3 className="font-semibold">Analogies</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {result.analogies.map((analogy, i) => (
                        <li key={i}>{analogy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <Target size={48} className="mb-4" />
                <p>Explanation will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExplainer;
