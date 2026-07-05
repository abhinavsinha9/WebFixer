import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineFolder, HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineEllipsisVertical, HiOutlineTrash, HiOutlineArrowPath } from 'react-icons/hi2';
import api from '../services/api';
import toast from 'react-hot-toast';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { fetchProjects(); }, [search, typeFilter]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      const { data } = await api.get(`/projects?${params}`);
      setProjects(data.projects || []);
    } catch (error) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its data?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const getScoreColor = (score) => score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  const getScoreBg = (score) => score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-dark-400 text-sm mt-1">{projects.length} projects total</p>
        </div>
        <Link to="/projects/new" className="gradient-btn flex items-center gap-2 text-sm w-fit">
          <HiOutlinePlus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..." className="input-field pl-10 text-sm" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field text-sm w-40">
          <option value="">All Types</option>
          <option value="react">React</option>
          <option value="nextjs">Next.js</option>
          <option value="vue">Vue</option>
          <option value="html">HTML</option>
          <option value="node">Node.js</option>
          <option value="website">Website</option>
        </select>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-5 bg-dark-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-dark-700 rounded w-1/2 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-dark-700 rounded w-16"></div>
                <div className="h-6 bg-dark-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <motion.div key={project._id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5 cursor-pointer group" onClick={() => navigate(`/projects/${project._id}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 flex items-center justify-center border border-primary-500/20">
                    <HiOutlineFolder className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm group-hover:text-primary-400 transition-colors">{project.name}</h3>
                    <p className="text-xs text-dark-400">{project.type} · {project.source}</p>
                  </div>
                </div>
                <button onClick={(e) => deleteProject(project._id, e)} className="opacity-0 group-hover:opacity-100 transition-opacity text-dark-400 hover:text-red-400 p-1">
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>

              {/* Score bar */}
              {project.scores?.overall > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-dark-400">Health Score</span>
                    <span className={`text-xs font-semibold ${getScoreColor(project.scores.overall)}`}>{project.scores.overall}/100</span>
                  </div>
                  <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${getScoreBg(project.scores.overall)}`}
                      style={{ width: `${project.scores.overall}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${project.status === 'analyzed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  project.status === 'analyzing' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-dark-600/50 text-dark-300 border-dark-500/30'}`}>
                  {project.status}
                </span>
                {project.analysis?.totalBugs > 0 && (
                  <span className="badge bg-red-500/20 text-red-400 border-red-500/30">
                    {project.analysis.totalBugs} bugs
                  </span>
                )}
                <span className="text-xs text-dark-500 ml-auto">{project.fileCount} files</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center">
          <HiOutlineFolder className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-dark-400 text-sm mb-6">Import your first project to start analyzing</p>
          <Link to="/projects/new" className="gradient-btn inline-flex items-center gap-2 text-sm">
            <HiOutlinePlus className="w-4 h-4" /> Create Project
          </Link>
        </div>
      )}
    </div>
  );
};

export default Projects;
