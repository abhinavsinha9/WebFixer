import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineBugAnt, HiOutlineFunnel, HiOutlineMagnifyingGlass, HiOutlineChevronRight } from 'react-icons/hi2';
import api from '../services/api';

const severityColors = {
  critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low', info: 'badge-info'
};

const Analysis = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => { fetchAnalysis(); }, [id]);

  const fetchAnalysis = async () => {
    try {
      const { data: result } = await api.get(`/analysis/${id}`);
      setData(result);
    } catch (e) { setData(null); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="glass-card p-12 text-center animate-pulse"><div className="h-6 bg-dark-700 rounded w-48 mx-auto"></div></div>;
  if (!data) return <div className="glass-card p-12 text-center"><p className="text-dark-400">Run analysis first to see results.</p><Link to={`/projects/${id}`} className="gradient-btn text-sm mt-4 inline-block">Go Back</Link></div>;

  const categories = [{ name: 'all', count: data.bugs?.length || 0 }, ...(data.summary?.categories || [])];
  const filteredBugs = activeCategory === 'all' ? (data.bugs || []) : (data.bugs || []).filter(b => b.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
          <p className="text-dark-400 text-sm mt-1">{data.summary?.total || 0} issues found in {data.project?.name}</p>
        </div>
        <Link to={`/projects/${id}`} className="text-sm text-primary-400 hover:text-primary-300">← Back to Project</Link>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(data.summary?.severities || {}).map(([sev, count]) => (
          <div key={sev} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold ${sev === 'critical' ? 'text-red-400' : sev === 'high' ? 'text-orange-400' : sev === 'medium' ? 'text-amber-400' : sev === 'low' ? 'text-blue-400' : 'text-slate-400'}`}>{count}</p>
            <p className="text-xs text-dark-400 mt-1 capitalize">{sev}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat.name ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-800/50 text-dark-400 border border-dark-700/30 hover:text-white'}`}>
            {cat.name.replace(/-/g, ' ')} ({cat.count})
          </button>
        ))}
      </div>

      {/* Bug List */}
      <div className="space-y-3">
        {filteredBugs.map((bug, i) => (
          <motion.div key={bug._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="glass-card-hover p-4">
            <Link to={`/projects/${id}/bugs/${bug._id}`} className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={severityColors[bug.severity]}>{bug.severity}</span>
                  <span className="badge bg-dark-700/50 text-dark-400 border-dark-600/30">{bug.category?.replace(/-/g, ' ')}</span>
                </div>
                <h3 className="font-medium text-white text-sm">{bug.title}</h3>
                {bug.affectedFile && <p className="text-xs text-dark-500 mt-1 font-mono">{bug.affectedFile}{bug.affectedLine > 0 ? `:${bug.affectedLine}` : ''}</p>}
                {bug.suggestedFix && <p className="text-xs text-dark-400 mt-1">💡 {bug.suggestedFix}</p>}
              </div>
              <HiOutlineChevronRight className="w-4 h-4 text-dark-500 mt-1 flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Analysis;
