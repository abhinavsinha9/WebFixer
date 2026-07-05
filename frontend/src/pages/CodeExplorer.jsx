import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineFolder, HiOutlineDocument, HiOutlineChevronRight, HiOutlineChevronDown } from 'react-icons/hi2';
import api from '../services/api';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const FileTreeItem = ({ name, item, depth = 0, onSelect, selectedFile }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const isDir = item.type === 'directory';
  const isSelected = !isDir && item.path === selectedFile;

  if (isDir) {
    return (
      <div>
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-dark-700/30 rounded text-sm transition-colors"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}>
          {expanded ? <HiOutlineChevronDown className="w-3 h-3 text-dark-400" /> : <HiOutlineChevronRight className="w-3 h-3 text-dark-400" />}
          <HiOutlineFolder className="w-4 h-4 text-primary-400" />
          <span className="text-dark-200 truncate">{name}</span>
        </button>
        {expanded && item.children && Object.entries(item.children).sort(([,a],[,b]) => (b.type === 'directory') - (a.type === 'directory'))
          .map(([childName, childItem]) => (
            <FileTreeItem key={childName} name={childName} item={childItem} depth={depth + 1} onSelect={onSelect} selectedFile={selectedFile} />
          ))}
      </div>
    );
  }

  return (
    <button onClick={() => onSelect(item.path)}
      className={`flex items-center gap-1.5 w-full px-2 py-1 rounded text-sm transition-colors ${isSelected ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-700/30 text-dark-300'}`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}>
      <HiOutlineDocument className="w-4 h-4 text-dark-400 flex-shrink-0" />
      <span className="truncate">{name}</span>
      {item.size && <span className="text-xs text-dark-600 ml-auto">{Math.round(item.size / 1024)}KB</span>}
    </button>
  );
};

const CodeExplorer = () => {
  const { id } = useParams();
  const [fileTree, setFileTree] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileLanguage, setFileLanguage] = useState('plaintext');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFiles(); }, [id]);

  const fetchFiles = async () => {
    try { const { data } = await api.get(`/projects/${id}/files`); setFileTree(data.fileTree); } catch (e) {}
    finally { setLoading(false); }
  };

  const selectFile = async (path) => {
    setSelectedFile(path);
    try {
      const { data } = await api.get(`/projects/${id}/file/${path}`, { params: { path } });
      setFileContent(data.file?.content || '// No content available');
      setFileLanguage(data.file?.language || 'plaintext');
    } catch (e) { setFileContent('// Failed to load file'); }
  };

  if (loading) return <div className="glass-card p-8 animate-pulse"><div className="h-6 bg-dark-700 rounded w-1/3"></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Code Explorer</h1>
        <Link to={`/projects/${id}`} className="text-sm text-primary-400 hover:text-primary-300">← Back</Link>
      </div>
      <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
        {/* File Tree */}
        <div className="glass-card p-3 overflow-y-auto">
          <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider px-2 mb-2">Files</h3>
          {fileTree && Object.entries(fileTree).sort(([,a],[,b]) => (b.type === 'directory') - (a.type === 'directory'))
            .map(([name, item]) => (
              <FileTreeItem key={name} name={name} item={item} onSelect={selectFile} selectedFile={selectedFile} />
            ))}
          {!fileTree && <p className="text-dark-400 text-sm px-2">No files found</p>}
        </div>
        {/* Editor */}
        <div className="lg:col-span-3 glass-card overflow-hidden flex flex-col">
          {selectedFile ? (
            <>
              <div className="px-4 py-2 border-b border-dark-700/50 flex items-center gap-2">
                <span className="text-xs font-mono text-dark-400 truncate">{selectedFile}</span>
                <span className="badge bg-dark-700/50 text-dark-400 border-dark-600/30 text-xs ml-auto">{fileLanguage}</span>
              </div>
              <div className="flex-1">
                <Suspense fallback={<div className="p-8 text-center text-dark-400">Loading editor...</div>}>
                  <MonacoEditor height="100%" language={fileLanguage === 'javascript' ? 'javascript' : fileLanguage === 'typescript' ? 'typescript' : fileLanguage}
                    theme="vs-dark" value={fileContent}
                    options={{ readOnly: true, minimap: { enabled: true }, fontSize: 13, scrollBeyondLastLine: false, wordWrap: 'on',
                      padding: { top: 16 }, lineNumbers: 'on', renderWhitespace: 'selection' }} />
                </Suspense>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center"><HiOutlineDocument className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">Select a file to view its contents</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeExplorer;
