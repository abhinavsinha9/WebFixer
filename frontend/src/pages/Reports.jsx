import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlinePlus, HiOutlineArrowDownTray, HiOutlineTrash } from 'react-icons/hi2';
import api from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try { const { data } = await api.get('/reports'); setReports(data.reports || []); } catch (e) { setReports([]); }
    finally { setLoading(false); }
  };

  const deleteReport = async (id, e) => {
    e.stopPropagation();
    try { await api.delete(`/reports/${id}`); toast.success('Report deleted'); fetchReports(); } catch (e) { toast.error('Failed'); }
  };

  const exportReport = async (id, format, e) => {
    e.stopPropagation();
    try {
      const response = await api.get(`/reports/${id}/export/${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `report.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link); link.click(); link.remove();
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (e) { toast.error('Export failed'); }
  };

  const typeColors = { 'bug-report': 'from-red-500 to-rose-500', performance: 'from-amber-500 to-orange-500', accessibility: 'from-blue-500 to-cyan-500',
    seo: 'from-violet-500 to-purple-500', security: 'from-emerald-500 to-green-500', 'full-audit': 'from-primary-500 to-blue-500',
    'code-quality': 'from-pink-500 to-rose-500', improvement: 'from-cyan-500 to-teal-500' };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Reports</h1><p className="text-dark-400 text-sm mt-1">{reports.length} reports generated</p></div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="glass-card p-5 animate-pulse"><div className="h-5 bg-dark-700 rounded w-3/4 mb-3"></div><div className="h-3 bg-dark-700 rounded w-1/2"></div></div>)}</div>
      ) : reports.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, i) => (
            <motion.div key={report._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5 cursor-pointer group" onClick={() => navigate(`/reports/${report._id}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[report.type] || typeColors['full-audit']} flex items-center justify-center`}>
                  <HiOutlineDocumentText className="w-5 h-5 text-white" />
                </div>
                <button onClick={(e) => deleteReport(report._id, e)} className="opacity-0 group-hover:opacity-100 text-dark-400 hover:text-red-400 transition-all p-1"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{report.title}</h3>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="badge bg-dark-700/50 text-dark-300 border-dark-600/30">{report.type?.replace(/-/g, ' ')}</span>
                <span className="text-xs text-dark-500">{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
              {report.data?.score !== undefined && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-dark-400">Score:</span>
                  <span className={`text-sm font-bold ${report.data.score >= 80 ? 'text-emerald-400' : report.data.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{report.data.score}/100</span>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={(e) => exportReport(report._id, 'pdf', e)} className="text-xs px-2 py-1 rounded bg-primary-500/20 text-primary-400 hover:bg-primary-500/30">PDF</button>
                <button onClick={(e) => exportReport(report._id, 'csv', e)} className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">CSV</button>
                <button onClick={(e) => exportReport(report._id, 'excel', e)} className="text-xs px-2 py-1 rounded bg-violet-500/20 text-violet-400 hover:bg-violet-500/30">Excel</button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center"><HiOutlineDocumentText className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No reports yet</h3>
          <p className="text-dark-400 text-sm">Analyze a project first, then generate reports.</p></div>
      )}
    </div>
  );
};

export default Reports;
