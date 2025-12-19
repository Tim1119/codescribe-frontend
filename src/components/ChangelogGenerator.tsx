import { useState } from 'react';
import CodeEditor from './CodeEditor';
import MarkdownPreview from './MarkdownPreview';
import ExportButtons from './ExportButtons';
import { Sparkles, Loader2, GitCompare, AlertTriangle } from 'lucide-react';
import { API_URL } from '../config';

interface ChangelogResponse {
  changelog: string;
  version_suggestion: string;
  breaking_changes: string[];
}

const ChangelogGenerator = () => {
  const [oldCode, setOldCode] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');
  const [format, setFormat] = useState<string>('Keep a Changelog');
  const [result, setResult] = useState<ChangelogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!oldCode.trim() || !newCode.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/changelog/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_code: oldCode, new_code: newCode, format })
      });

      if (!response.ok) throw new Error('Failed to generate changelog');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error generating changelog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Changelog Generator</h1>
        <p className="text-slate-400">Generate professional changelogs by comparing code versions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-4">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Keep a Changelog">Keep a Changelog</option>
                <option value="Conventional Commits">Conventional Commits</option>
                <option value="Simple List">Simple List</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !oldCode.trim() || !newCode.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Generate
            </button>
          </div>

          <div className="flex-1 grid grid-rows-2 gap-4 min-h-0">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-400">Previous Version</span>
              <div className="flex-1 min-h-0">
                <CodeEditor
                  value={oldCode}
                  onChange={(val) => setOldCode(val || '')}
                  language="python"
                  height="100%"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-400">New Version</span>
              <div className="flex-1 min-h-0">
                <CodeEditor
                  value={newCode}
                  onChange={(val) => setNewCode(val || '')}
                  language="python"
                  height="100%"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-4 bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
            <h2 className="font-semibold text-slate-200">Generated Changelog</h2>
            {result && <ExportButtons content={result.changelog} filename="CHANGELOG.md" />}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
            {result ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-sm">
                    <span className="text-slate-400">Suggested Version: </span>
                    <span className="text-primary font-mono font-bold">{result.version_suggestion}</span>
                  </div>
                </div>

                {result.breaking_changes.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-400 mb-2 font-semibold">
                      <AlertTriangle size={18} />
                      <h3>Breaking Changes</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-red-300/80 text-sm">
                      {result.breaking_changes.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  <MarkdownPreview content={result.changelog} />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <GitCompare size={48} className="mb-4" />
                <p>Changelog will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogGenerator;
