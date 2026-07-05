import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowUpTray, HiOutlineGlobeAlt, HiOutlineCodeBracket, HiOutlineFolder, HiOutlineArrowRight, HiOutlineDocument } from 'react-icons/hi2';
import api from '../services/api';
import toast from 'react-hot-toast';

const importMethods = [
  { id: 'url', icon: HiOutlineGlobeAlt, title: 'Website URL', desc: 'Analyze any live website by URL', color: 'from-blue-500 to-cyan-500' },
  { id: 'upload', icon: HiOutlineArrowUpTray, title: 'Upload ZIP', desc: 'Upload a project archive file', color: 'from-emerald-500 to-green-500' },
  { id: 'github', icon: HiOutlineCodeBracket, title: 'GitHub Repository', desc: 'Connect and import from GitHub', color: 'from-violet-500 to-purple-500' },
];

const NewProject = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', description: '', file: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (method === 'url') {
        response = await api.post('/projects/url', {
          url: formData.url,
          name: formData.name || undefined,
          description: formData.description
        });
      } else if (method === 'upload') {
        const fd = new FormData();
        fd.append('project', formData.file);
        fd.append('name', formData.name);
        fd.append('description', formData.description);
        response = await api.post('/projects/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (method === 'github') {
        response = await api.post('/projects/github', {
          repoUrl: formData.url,
          name: formData.name || undefined,
          description: formData.description
        });
      }

      toast.success('Project imported successfully!');
      navigate(`/projects/${response.data.project.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-2">Import Project</h1>
        <p className="text-dark-400 text-sm mb-8">Choose how you'd like to import your project for analysis.</p>

        {/* Method Selection */}
        {!method ? (
          <div className="space-y-3">
            {importMethods.map((m, i) => (
              <motion.button key={m.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                onClick={() => setMethod(m.id)}
                className="w-full glass-card-hover p-5 flex items-center gap-4 text-left group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <m.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{m.title}</h3>
                  <p className="text-xs text-dark-400 mt-0.5">{m.desc}</p>
                </div>
                <HiOutlineArrowRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors" />
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-5">
            <button type="button" onClick={() => setMethod(null)}
              className="text-sm text-primary-400 hover:text-primary-300 font-medium mb-4">
              ← Choose different method
            </button>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Project Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field" placeholder="My Awesome Project" required />
            </div>

            {/* Method-specific input */}
            {method === 'url' && (
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Website URL</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input-field" placeholder="https://example.com" required />
              </div>
            )}

            {method === 'github' && (
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">GitHub Repository URL</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input-field" placeholder="https://github.com/user/repo" required />
              </div>
            )}

            {method === 'upload' && (
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">Project Archive</label>
                <div className="glass-card p-8 text-center border-2 border-dashed border-dark-600 hover:border-primary-500/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-input').click()}>
                  <HiOutlineArrowUpTray className="w-8 h-8 text-dark-400 mx-auto mb-3" />
                  <p className="text-sm text-dark-300">{formData.file ? formData.file.name : 'Click to upload ZIP file'}</p>
                  <p className="text-xs text-dark-500 mt-1">ZIP, TAR, GZ (max 100MB)</p>
                  <input id="file-input" type="file" accept=".zip,.tar,.gz,.tgz" className="hidden"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Description (optional)</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field h-20 resize-none" placeholder="Brief project description..." />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="gradient-btn w-full py-3 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Importing...
                </>
              ) : (
                <>Import & Analyze</>
              )}
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default NewProject;
