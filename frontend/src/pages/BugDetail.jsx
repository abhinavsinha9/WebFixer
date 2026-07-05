import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const BugDetail = () => {
  const { id, bugId } = useParams();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => { fetchBug(); }, [bugId]);

  const fetchBug = async () => {
    try { const { data } = await api.get(`/bugs/${bugId}`); setBug(data.bug); } catch (e) {}
    finally { setLoading(false); }
  };

  const updateStatus = async (status) => {
    try { await api.put(`/bugs/${bugId}`, { status }); toast.success('Status updated'); fetchBug(); } catch (e) { toast.error('Update failed'); }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try { await api.post(`/bugs/${bugId}/comments`, { text: comment }); setComment(''); fetchBug(); toast.success('Comment added'); } catch (e) {}
  };

  if (loading) return <div className="glass-card p-8 animate-pulse"><div className="h-6 bg-dark-700 rounded w-1/3"></div></div>;
  if (!bug) return <div className="glass-card p-8 text-center"><p className="text-dark-400">Bug not found</p></div>;

  const sevMap = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low', info: 'badge-info' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={`/projects/${id}/bugs`} className="text-sm text-primary-400 hover:text-primary-300">← Back to Bugs</Link>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-mono text-dark-500 block mb-1">{bug.bugId}</span>
            <h1 className="text-xl font-bold text-white">{bug.title}</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={sevMap[bug.severity]}>{bug.severity}</span>
            <span className="badge bg-dark-700/50 text-dark-300 border-dark-600/30">{bug.priority}</span>
          </div>
        </div>
        <p className="text-dark-300 text-sm leading-relaxed mb-4">{bug.description}</p>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Category', value: bug.category?.replace(/-/g, ' ') },
            { label: 'Status', value: bug.status },
            { label: 'File', value: bug.affectedFile || 'N/A' },
            { label: 'Line', value: bug.affectedLine || 'N/A' },
            { label: 'Estimated Time', value: bug.estimatedTime || 'N/A' },
            { label: 'Created', value: new Date(bug.createdAt).toLocaleDateString() },
          ].map(item => (
            <div key={item.label}><span className="text-dark-500 text-xs">{item.label}</span><p className="text-dark-200 font-medium">{item.value}</p></div>
          ))}
        </div>
      </motion.div>

      {/* Root Cause & Fix */}
      <div className="grid sm:grid-cols-2 gap-4">
        {bug.rootCause && (
          <div className="glass-card p-5"><h3 className="text-sm font-semibold text-white mb-2">Root Cause</h3><p className="text-sm text-dark-300">{bug.rootCause}</p></div>
        )}
        {bug.suggestedFix && (
          <div className="glass-card p-5 border-emerald-500/20"><h3 className="text-sm font-semibold text-emerald-400 mb-2">💡 Suggested Fix</h3><p className="text-sm text-dark-300">{bug.suggestedFix}</p></div>
        )}
      </div>

      {/* Code Snippet */}
      {bug.codeSnippet && (
        <div className="glass-card p-5"><h3 className="text-sm font-semibold text-white mb-2">Code Snippet</h3><pre className="bg-dark-900/50 rounded-lg p-4 text-xs text-dark-200 overflow-x-auto font-mono">{bug.codeSnippet}</pre></div>
      )}

      {/* Status Actions */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Update Status</h3>
        <div className="flex gap-2 flex-wrap">
          {['open', 'in-progress', 'resolved', 'closed', 'wont-fix'].map(s => (
            <button key={s} onClick={() => updateStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${bug.status === s ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-700/50 text-dark-300 border border-dark-600/30 hover:text-white'}`}>
              {s.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Comments ({bug.comments?.length || 0})</h3>
        {bug.comments?.map((c, i) => (
          <div key={i} className="mb-3 p-3 bg-dark-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1"><span className="text-xs font-medium text-dark-200">{c.user?.name || 'User'}</span>
              <span className="text-xs text-dark-500">{new Date(c.createdAt).toLocaleDateString()}</span></div>
            <p className="text-sm text-dark-300">{c.text}</p>
          </div>
        ))}
        <form onSubmit={addComment} className="flex gap-2 mt-3">
          <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..."
            className="input-field flex-1 text-sm" />
          <button type="submit" className="gradient-btn text-sm px-4">Send</button>
        </form>
      </div>
    </div>
  );
};

export default BugDetail;
