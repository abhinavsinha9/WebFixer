import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  HiOutlineFolder, HiOutlineBugAnt, HiOutlineChartBar, HiOutlineShieldCheck,
  HiOutlineBolt, HiOutlineEye, HiOutlineMagnifyingGlass, HiOutlinePlus,
  HiOutlineArrowTrendingUp, HiOutlineArrowRight, HiOutlineClock,
  HiOutlineExclamationTriangle, HiOutlineCheckCircle
} from 'react-icons/hi2';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

const ScoreCircle = ({ score, label, size = 80, color }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={radius} stroke="#1e293b" strokeWidth="6" fill="none" />
          <circle cx={size/2} cy={size/2} r={radius} stroke={color || scoreColor} strokeWidth="6" fill="none"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{score}</span>
        </div>
      </div>
      <span className="text-xs text-dark-400 mt-2 font-medium">{label}</span>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/projects/stats/dashboard');
      setStats(data);
    } catch (error) {
      // Use demo data if API is not connected
      setStats({
        stats: { projects: 0, totalBugs: 0, criticalBugs: 0, openBugs: 0, resolvedBugs: 0, closedBugs: 0,
          scores: { performance: 0, accessibility: 0, seo: 0, security: 0, overall: 0 } },
        recentProjects: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: HiOutlineFolder, label: 'Projects', value: stats?.stats?.projects || 0, color: 'from-primary-500 to-blue-500', change: '+2 this month' },
    { icon: HiOutlineBugAnt, label: 'Bugs Found', value: stats?.stats?.totalBugs || 0, color: 'from-red-500 to-rose-500', change: `${stats?.stats?.criticalBugs || 0} critical` },
    { icon: HiOutlineCheckCircle, label: 'Resolved', value: stats?.stats?.resolvedBugs || 0, color: 'from-emerald-500 to-green-500', change: `${stats?.stats?.openBugs || 0} open` },
    { icon: HiOutlineChartBar, label: 'Health Score', value: stats?.stats?.scores?.overall || 0, color: 'from-violet-500 to-purple-500', change: '/100 average', isScore: true },
  ];

  const quickActions = [
    { icon: HiOutlinePlus, label: 'New Project', path: '/projects/new', color: 'from-primary-500 to-blue-500' },
    { icon: HiOutlineMagnifyingGlass, label: 'Scan Website', path: '/projects/new', color: 'from-emerald-500 to-green-500' },
    { icon: HiOutlineBugAnt, label: 'View Bugs', path: '/projects', color: 'from-red-500 to-rose-500' },
    { icon: HiOutlineChartBar, label: 'Reports', path: '/reports', color: 'from-violet-500 to-purple-500' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-dark-700 rounded w-20 mb-3"></div>
              <div className="h-8 bg-dark-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-dark-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Developer'}</span>
        </h1>
        <p className="text-dark-400 text-sm mt-1">Here's an overview of your projects and analysis results.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
            className="glass-card-hover p-5 group cursor-pointer" onClick={() => navigate(i === 0 ? '/projects' : i === 2 ? '/projects' : '/analytics')}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <HiOutlineArrowTrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stat.isScore ? `${stat.value}%` : stat.value}</p>
            <p className="text-xs text-dark-400 mt-1">{stat.label} · {stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Scores Overview */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}
          className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Website Health Scores</h2>
            <Link to="/analytics" className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1">
              View Details <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center justify-around flex-wrap gap-4">
            <ScoreCircle score={stats?.stats?.scores?.overall || 0} label="Overall" size={100} />
            <ScoreCircle score={stats?.stats?.scores?.performance || 0} label="Performance" />
            <ScoreCircle score={stats?.stats?.scores?.accessibility || 0} label="Accessibility" />
            <ScoreCircle score={stats?.stats?.scores?.seo || 0} label="SEO" />
            <ScoreCircle score={stats?.stats?.scores?.security || 0} label="Security" />
          </div>
          {stats?.stats?.projects === 0 && (
            <div className="text-center mt-6 p-4 bg-dark-800/50 rounded-lg border border-dark-700/30">
              <p className="text-dark-400 text-sm">No projects analyzed yet. Create a project to see your scores.</p>
              <Link to="/projects/new" className="gradient-btn text-sm mt-3 inline-block">Create First Project</Link>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}
          className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.path}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700/30 transition-all group">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-dark-200 group-hover:text-white transition-colors">{action.label}</span>
                <HiOutlineArrowRight className="w-4 h-4 text-dark-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
          <Link to="/projects" className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1">
            View All <HiOutlineArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {stats?.recentProjects?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="text-left text-xs font-medium text-dark-400 pb-3 uppercase tracking-wider">Project</th>
                  <th className="text-left text-xs font-medium text-dark-400 pb-3 uppercase tracking-wider">Type</th>
                  <th className="text-left text-xs font-medium text-dark-400 pb-3 uppercase tracking-wider">Status</th>
                  <th className="text-left text-xs font-medium text-dark-400 pb-3 uppercase tracking-wider">Score</th>
                  <th className="text-left text-xs font-medium text-dark-400 pb-3 uppercase tracking-wider">Bugs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {stats.recentProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-dark-800/30 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project._id}`)}>
                    <td className="py-3">
                      <span className="text-sm font-medium text-white">{project.name}</span>
                    </td>
                    <td className="py-3">
                      <span className="badge bg-dark-700/50 text-dark-300 border border-dark-600/50">{project.type}</span>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${project.status === 'analyzed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-sm font-semibold ${project.scores?.overall >= 80 ? 'text-emerald-400' : project.scores?.overall >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {project.scores?.overall || '-'}/100
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-dark-300">{project.analysis?.totalBugs || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <HiOutlineFolder className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400 text-sm mb-4">No projects yet. Start by importing your first project.</p>
            <Link to="/projects/new" className="gradient-btn text-sm inline-block">Import Project</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
