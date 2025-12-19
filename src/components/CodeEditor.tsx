import Editor, { type OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value, 
  onChange, 
  language = 'python', 
  readOnly = false,
  height = '500px'
}) => {
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Define custom theme
    monaco.editor.defineTheme('documint-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0F172A', // Slate 900
        'editor.lineHighlightBackground': '#1E293B', // Slate 800
      }
    });
    monaco.editor.setTheme('documint-dark');
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700 shadow-sm" style={{ height }}>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: readOnly,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
};

export default CodeEditor;
