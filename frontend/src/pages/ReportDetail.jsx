import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await api.get(`/reports/${id}`); setReport(data.report); } catch (e) {}
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const exportReport = async (format) => {
    try {
      const response = await api.get(`/reports/${id}/export/${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `report.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link); link.click(); link.remove();
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (e) { toast.error('Export failed'); }
  };

  if (loading) return <div className="glass-card p-8 animate-pulse"><div className="h-6 bg-dark-700 rounded w-1/3"></div></div>;
  if (!report) return <div className="glass-card p-8 text-center"><p className="text-dark-400">Report not found</p></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/reports" className="text-sm text-primary-400 hover:text-primary-300">← Back to Reports</Link>
      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-2">{report.title}</h1>
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="badge bg-primary-500/20 text-primary-400 border-primary-500/30">{report.type?.replace(/-/g, ' ')}</span>
          <span className="text-xs text-dark-500">{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex gap-2 mb-6">
          {['pdf', 'csv', 'excel'].map(f => (
            <button key={f} onClick={() => exportReport(f)} className="gradient-btn-outline text-xs px-3 py-1.5">Export {f.toUpperCase()}</button>
          ))}
        </div>
      </div>
      {report.data?.score !== undefined && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Score</h2>
          <div className="text-5xl font-bold gradient-text">{report.data.score}/100</div>
          <p className="text-dark-400 text-sm mt-2">{report.data.totalIssues} total issues · {report.data.criticalIssues} critical</p>
        </div>
      )}
      {report.data?.recommendations?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {report.data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                <span className="text-primary-400 mt-0.5">💡</span>{rec}
              </li>
            ))}
          </ul>
        </div>
      )}
      {report.data?.details?.bugs?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Issues ({report.data.details.bugs.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {report.data.details.bugs.map((bug, i) => (
              <div key={i} className="p-3 bg-dark-800/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${bug.severity === 'critical' ? 'badge-critical' : bug.severity === 'high' ? 'badge-high' : 'badge-medium'}`}>{bug.severity}</span>
                  <span className="badge bg-dark-700/50 text-dark-400 border-dark-600/30">{bug.category?.replace(/-/g, ' ')}</span>
                </div>
                <p className="text-sm font-medium text-white">{bug.title}</p>
                {bug.affectedFile && <p className="text-xs text-dark-500 font-mono mt-1">{bug.affectedFile}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
