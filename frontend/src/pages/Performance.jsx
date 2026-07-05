import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineBolt } from 'react-icons/hi2';
import api from '../services/api';

const MetricCard = ({ label, value, status }) => {
  const color = status === 'good' ? 'text-emerald-400 bg-emerald-500/10' : status === 'needs-improvement' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10';
  return (
    <div className="glass-card p-4 text-center">
      <p className={`text-2xl font-bold ${color.split(' ')[0]}`}>{value}</p>
      <p className="text-xs text-dark-400 mt-1">{label}</p>
      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${color}`}>{status?.replace(/-/g, ' ')}</span>
    </div>
  );
};

const Performance = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const { data: result } = await api.get(`/analysis/${id}/performance`); setData(result.performance); } catch (e) {}
      finally { setLoading(false); }
    }; fetch();
  }, [id]);

  if (loading) return <div className="glass-card p-8 animate-pulse"><div className="h-6 bg-dark-700 rounded w-1/3"></div></div>;

  const metrics = data?.metrics;
  const getStatus = (score) => score >= 80 ? 'good' : score >= 50 ? 'needs-improvement' : 'poor';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Performance Report</h1><p className="text-dark-400 text-sm mt-1">Lighthouse-style analysis</p></div>
        <Link to={`/projects/${id}`} className="text-sm text-primary-400 hover:text-primary-300">← Back</Link>
      </div>

      {metrics ? (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
            <div className="inline-block relative w-32 h-32">
              <svg className="transform -rotate-90" width="128" height="128">
                <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="8" fill="none" />
                <circle cx="64" cy="64" r="56" stroke={metrics.score >= 80 ? '#10b981' : metrics.score >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={352} strokeDashoffset={352 - (metrics.score / 100) * 352} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-bold text-white">{metrics.score}</span></div>
            </div>
            <p className="text-dark-400 text-sm mt-3">Performance Score</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard label="LCP" value={metrics.lcp} status={getStatus(metrics.score)} />
            <MetricCard label="INP" value={metrics.inp} status={getStatus(metrics.score)} />
            <MetricCard label="CLS" value={metrics.cls} status={metrics.cls <= '0.1' ? 'good' : 'needs-improvement'} />
            <MetricCard label="TTFB" value={metrics.ttfb} status={getStatus(metrics.score)} />
            <MetricCard label="FCP" value={metrics.fcp} status={getStatus(metrics.score)} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'JavaScript', value: `${Math.round(metrics.jsSize / 1024)}KB`, count: `${metrics.jsFileCount} files` },
              { label: 'CSS', value: `${Math.round(metrics.cssSize / 1024)}KB`, count: `${metrics.cssFileCount} files` },
              { label: 'Images', value: `${Math.round(metrics.imageSize / 1024)}KB`, count: `${metrics.imageFileCount} files` },
              { label: 'Total', value: `${Math.round(metrics.totalSize / 1024)}KB`, count: `${metrics.fileCount} files` },
            ].map((item, i) => (
              <div key={i} className="glass-card p-4"><p className="text-xs text-dark-400 mb-1">{item.label}</p>
                <p className="text-lg font-bold text-white">{item.value}</p><p className="text-xs text-dark-500">{item.count}</p></div>
            ))}
          </div>

          {data.recommendations?.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Optimization Recommendations</h2>
              <ul className="space-y-2">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dark-300"><span className="text-emerald-400">✓</span>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-12 text-center"><HiOutlineBolt className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400 text-sm">No performance data. Run analysis first.</p></div>
      )}
    </div>
  );
};

export default Performance;
