import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import { Sparkles, Loader2, Activity, AlertCircle, Info } from 'lucide-react';
import { API_URL } from '../config';

interface Suggestion {
  title: string;
  description: string;
  line: number;
}

interface ScoreBreakdown {
  completeness: number;
  clarity: number;
  accuracy: number;
  coverage: number;
}

interface HealthResult {
  score: number;
  breakdown: ScoreBreakdown;
  suggestions: Suggestion[];
}

const DocHealthScore = () => {
  const [code, setCode] = useState<string>('');
  const [result, setResult] = useState<HealthResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/health/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) throw new Error('Failed to analyze code');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Documentation Health Score</h1>
        <p className="text-slate-400">Analyze your code documentation quality and get actionable insights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !code.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Analyze Health
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
            <h2 className="font-semibold text-slate-200">Analysis Result</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
            {result ? (
              <div className="space-y-8">
                {/* Overall Score */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-800 border border-slate-700">
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}>
                    {result.score}
                  </div>
                  <div className="text-slate-400 font-medium">Overall Health Score</div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-slate-400 capitalize">{key}</span>
                        <span className={`font-bold ${getScoreColor(value)}`}>{value}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(value).replace('text-', 'bg-')}`} 
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Info size={20} className="text-primary" />
                      Improvements
                    </h3>
                    <div className="space-y-3">
                      {result.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex gap-4">
                          <div className="mt-1">
                            <AlertCircle size={18} className="text-yellow-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-200">{suggestion.title}</span>
                              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">Line {suggestion.line}</span>
                            </div>
                            <p className="text-sm text-slate-400">{suggestion.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <Activity size={48} className="mb-4" />
                <p>Health analysis will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocHealthScore;
