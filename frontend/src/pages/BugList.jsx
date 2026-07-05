import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineBugAnt, HiOutlineFunnel, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import api from '../services/api';

const BugList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ severity: '', status: '', search: '' });

  useEffect(() => { fetchBugs(); }, [id, filters]);

  const fetchBugs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      const { data } = await api.get(`/bugs/project/${id}?${params}`);
      setBugs(data.bugs || []);
    } catch (e) { setBugs([]); }
    finally { setLoading(false); }
  };

  const updateBugStatus = async (bugId, status, e) => {
    e.stopPropagation();
    try {
      await api.put(`/bugs/${bugId}`, { status });
      fetchBugs();
    } catch (e) {}
  };

  const sevColors = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-blue-500', info: 'bg-slate-500' };
  const statusColors = { open: 'text-amber-400 bg-amber-500/20', 'in-progress': 'text-blue-400 bg-blue-500/20', resolved: 'text-emerald-400 bg-emerald-500/20', closed: 'text-slate-400 bg-slate-500/20' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Bug Tracker</h1><p className="text-dark-400 text-sm mt-1">{bugs.length} bugs found</p></div>
        <Link to={`/projects/${id}`} className="text-sm text-primary-400 hover:text-primary-300">← Back</Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search bugs..." className="input-field pl-10 text-sm" />
        </div>
        <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className="input-field text-sm w-36">
          <option value="">All Severity</option>
          {['critical', 'high', 'medium', 'low', 'info'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input-field text-sm w-36">
          <option value="">All Status</option>
          {['open', 'in-progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {bugs.map((bug, i) => (
          <motion.div key={bug._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
            className="glass-card-hover p-4 cursor-pointer" onClick={() => navigate(`/projects/${id}/bugs/${bug._id}`)}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${sevColors[bug.severity]}`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono text-dark-500">{bug.bugId}</span>
                  <span className={`badge text-xs ${statusColors[bug.status] || 'text-dark-400 bg-dark-700/50'}`}>{bug.status}</span>
                </div>
                <h3 className="font-medium text-white text-sm truncate">{bug.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-dark-500">
                  <span>{bug.category?.replace(/-/g, ' ')}</span>
                  {bug.affectedFile && <span className="font-mono truncate max-w-[200px]">{bug.affectedFile}</span>}
                  {bug.estimatedTime && <span>⏱ {bug.estimatedTime}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {bug.status === 'open' && <button onClick={(e) => updateBugStatus(bug._id, 'in-progress', e)} className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Start</button>}
                {bug.status === 'in-progress' && <button onClick={(e) => updateBugStatus(bug._id, 'resolved', e)} className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Resolve</button>}
              </div>
            </div>
          </motion.div>
        ))}
        {!loading && bugs.length === 0 && (
          <div className="glass-card p-12 text-center"><HiOutlineBugAnt className="w-12 h-12 text-dark-600 mx-auto mb-3" /><p className="text-dark-400 text-sm">No bugs found. Run analysis to detect issues.</p></div>
        )}
      </div>
    </div>
  );
};

export default BugList;
