import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DocumentationGenerator from './components/DocumentationGenerator';
import ReadmeGenerator from './components/ReadmeGenerator';
import ApiDocsGenerator from './components/ApiDocsGenerator';
import CodeExplainer from './components/CodeExplainer';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import CodeQA from './components/CodeQA';
import ChangelogGenerator from './components/ChangelogGenerator';
import DocHealthScore from './components/DocHealthScore';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DocumentationGenerator />} />
          <Route path="readme" element={<ReadmeGenerator />} />
          <Route path="api-docs" element={<ApiDocsGenerator />} />
          <Route path="explainer" element={<CodeExplainer />} />
          <Route path="diagrams" element={<ArchitectureDiagram />} />
          <Route path="qa" element={<CodeQA />} />
          <Route path="changelog" element={<ChangelogGenerator />} />
          <Route path="health" element={<DocHealthScore />} />
          {/* Add other routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
