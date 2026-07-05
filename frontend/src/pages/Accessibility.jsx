import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineEye } from 'react-icons/hi2';
import api from '../services/api';

const Accessibility = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { try { const { data: r } = await api.get(`/analysis/${id}/accessibility`); setData(r.accessibility); } catch (e) {} finally { setLoading(false); } };
    fetch();
  }, [id]);

  if (loading) return <div className="glass-card p-8 animate-pulse"><div className="h-6 bg-dark-700 rounded w-1/3"></div></div>;

  const wcag = data?.wcagChecks;
  const principles = [
    { key: 'perceivable', label: 'Perceivable', desc: 'Content must be presentable to users in ways they can perceive' },
    { key: 'operable', label: 'Operable', desc: 'UI components and navigation must be operable' },
    { key: 'understandable', label: 'Understandable', desc: 'Information and UI operation must be understandable' },
    { key: 'robust', label: 'Robust', desc: 'Content must be robust enough for diverse user agents' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Accessibility Report</h1><p className="text-dark-400 text-sm mt-1">WCAG 2.1 Compliance</p></div>
        <Link to={`/projects/${id}`} className="text-sm text-primary-400 hover:text-primary-300">← Back</Link>
      </div>

      {data ? (
        <>
          <div className="glass-card p-8 text-center">
            <div className="text-5xl font-bold gradient-text mb-2">{data.score}/100</div>
            <p className="text-dark-400">Accessibility Score · {data.totalIssues} issues</p>
          </div>

          {wcag && (
            <div className="grid sm:grid-cols-2 gap-4">
              {principles.map(p => (
                <div key={p.key} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm">{p.label}</h3>
                    <span className={`text-lg font-bold ${(wcag[p.key]?.score || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{wcag[p.key]?.score || 0}</span>
                  </div>
                  <p className="text-xs text-dark-400 mb-2">{p.desc}</p>
                  <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${(wcag[p.key]?.score || 0) >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${wcag[p.key]?.score || 0}%` }}></div>
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{wcag[p.key]?.issues || 0} issues</p>
                </div>
              ))}
            </div>
          )}

          {data.issues?.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Issues ({data.issues.length})</h2>
              <div className="space-y-2">
                {data.issues.map((issue, i) => (
                  <div key={i} className="p-3 bg-dark-800/30 rounded-lg">
                    <p className="text-sm font-medium text-white">{issue.title}</p>
                    <p className="text-xs text-dark-400 mt-1">{issue.description}</p>
                    {issue.suggestedFix && <p className="text-xs text-emerald-400 mt-1">💡 {issue.suggestedFix}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card p-12 text-center"><HiOutlineEye className="w-12 h-12 text-dark-600 mx-auto mb-3" /><p className="text-dark-400 text-sm">No accessibility data. Run analysis first.</p></div>
      )}
    </div>
  );
};

export default Accessibility;
