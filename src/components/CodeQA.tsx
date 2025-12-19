import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Send, Loader2, MessageSquare, Code, User, Bot } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';
import { API_URL } from '../config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FileContent {
  name: string;
  content: string;
}

interface CodeRef {
  file: string;
  line_start: number;
  line_end: number;
  snippet: string;
}

const CodeQA = () => {
  const [files, setFiles] = useState<FileContent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeRefs, setCodeRefs] = useState<CodeRef[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setFiles(prev => [...prev, { name: file.name, content }]);
      };
      reader.readAsText(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const codeContext = files.map(f => `--- ${f.name} ---\n${f.content}`).join('\n\n');
      
      const response = await fetch(`${API_URL}/api/qa/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          code_context: codeContext,
          history: messages
        })
      });

      if (!response.ok) throw new Error('Failed to get answer');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      setCodeRefs(data.code_references);
    } catch (error) {
      console.error('Error asking question:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Interactive Code Q&A</h1>
        <p className="text-slate-400">Ask questions about your codebase and get AI-powered answers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Context Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
          <h2 className="font-semibold text-slate-200 flex items-center gap-2">
            <Code size={20} />
            Code Context
          </h2>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-slate-700 hover:border-primary/50 hover:bg-slate-800/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto mb-2 text-slate-400" size={24} />
            <p className="text-slate-300 text-sm font-medium">Drop files here</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 overflow-hidden">
                  <File size={14} className="text-primary flex-shrink-0" />
                  <span className="text-xs text-slate-300 truncate">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {codeRefs.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">References</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {codeRefs.map((ref, i) => (
                  <div key={i} className="bg-slate-900/50 p-2 rounded border border-slate-700/50 text-xs">
                    <div className="font-mono text-primary mb-1">{ref.file}:{ref.line_start}-{ref.line_end}</div>
                    <pre className="text-slate-400 overflow-x-auto">{ref.snippet}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2 flex flex-col bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <MessageSquare size={48} className="mb-4" />
                <p>Start asking questions about your code</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <Bot size={18} />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    <MarkdownPreview content={msg.content} />
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot size={18} />
                </div>
                <div className="bg-slate-700 rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="animate-spin text-slate-400" size={16} />
                  <span className="text-slate-400 text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-900/50 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question about your code..."
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeQA;
