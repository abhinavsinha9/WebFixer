import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineBolt, HiOutlineShieldCheck, HiOutlineEye, HiOutlineMagnifyingGlass, HiOutlineBugAnt, HiOutlineCodeBracket, HiOutlineDocumentText, HiOutlineArrowPath, HiOutlineChartBar } from 'react-icons/hi2';
import api from '../services/api';
import toast from 'react-hot-toast';

const ScoreCircle = ({ score, size = 64 }) => {
  const r = (size - 6) / 2; const c = r * 2 * Math.PI; const o = c - (score / 100) * c;
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#1e293b" strokeWidth="5" fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={o} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-white">{score}</span></div>
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [bugSummary, setBugSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data.project);
      setBugSummary(data.bugSummary || {});
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally { setLoading(false); }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      await api.post(`/analysis/${id}`);
      toast.success('Analysis complete!');
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Analysis failed');
    } finally { setAnalyzing(false); }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card p-6 animate-pulse"><div className="h-6 bg-dark-700 rounded w-1/3"></div></div>)}</div>;
  if (!project) return null;

  const tabs = [
    { icon: HiOutlineBugAnt, label: 'Bugs', path: `/projects/${id}/bugs`, count: project.analysis?.totalBugs },
    { icon: HiOutlineChartBar, label: 'Analysis', path: `/projects/${id}/analysis` },
    { icon: HiOutlineCodeBracket, label: 'Code', path: `/projects/${id}/code` },
    { icon: HiOutlineBolt, label: 'Performance', path: `/projects/${id}/performance` },
    { icon: HiOutlineEye, label: 'Accessibility', path: `/projects/${id}/accessibility` },
    { icon: HiOutlineMagnifyingGlass, label: 'SEO', path: `/projects/${id}/seo` },
    { icon: HiOutlineShieldCheck, label: 'Security', path: `/projects/${id}/security` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="badge bg-dark-700/50 text-dark-300 border-dark-600/50">{project.type}</span>
              <span className="badge bg-dark-700/50 text-dark-300 border-dark-600/50">{project.source}</span>
              <span className={`badge ${project.status === 'analyzed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                {project.status}
              </span>
              <span className="text-xs text-dark-500">{project.fileCount} files · {Math.round((project.totalSize || 0) / 1024)}KB</span>
            </div>
          </div>
          <button onClick={runAnalysis} disabled={analyzing} className="gradient-btn flex items-center gap-2 text-sm w-fit">
            <HiOutlineArrowPath className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </motion.div>

      {/* Scores */}
      {project.scores?.overall > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Health Scores</h2>
          <div className="flex items-center justify-around flex-wrap gap-6">
            {[
              { label: 'Overall', score: project.scores.overall },
              { label: 'Performance', score: project.scores.performance },
              { label: 'Accessibility', score: project.scores.accessibility },
              { label: 'SEO', score: project.scores.seo },
              { label: 'Security', score: project.scores.security },
              { label: 'Code Quality', score: project.scores.codeQuality },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <ScoreCircle score={s.score} />
                <span className="text-xs text-dark-400 mt-2">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {tabs.map((tab, i) => (
          <Link key={i} to={tab.path} className="glass-card-hover p-4 text-center group">
            <tab.icon className="w-6 h-6 mx-auto mb-2 text-dark-400 group-hover:text-primary-400 transition-colors" />
            <span className="text-xs font-medium text-dark-300 group-hover:text-white transition-colors">{tab.label}</span>
            {tab.count > 0 && (
              <span className="block text-xs text-primary-400 mt-1">{tab.count}</span>
            )}
          </Link>
        ))}
      </motion.div>

      {/* Bug Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Bug Summary</h2>
          <Link to={`/projects/${id}/bugs`} className="text-xs text-primary-400 hover:text-primary-300 font-medium">View All →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: project.analysis?.totalBugs || 0, color: 'text-white' },
            { label: 'Critical', value: project.analysis?.criticalBugs || 0, color: 'text-red-400' },
            { label: 'Warnings', value: project.analysis?.warningBugs || 0, color: 'text-amber-400' },
            { label: 'Info', value: project.analysis?.infoBugs || 0, color: 'text-blue-400' },
            { label: 'Fixed', value: project.analysis?.fixedBugs || 0, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-3 bg-dark-800/30 rounded-lg">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-dark-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetail;
