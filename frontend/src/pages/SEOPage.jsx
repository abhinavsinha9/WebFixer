import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import api from '../services/api';

const SEOPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { try { const { data: r } = await api.get(`/analysis/${id}/seo`); setData(r.seo); } catch (e) {} finally { setLoading(false); } };
    fetch();
  }, [id]);

  if (loading) return <div className="glass-card p-8 animate-pulse"><div className="h-6 bg-dark-700 rounded w-1/3"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">SEO Report</h1><p className="text-dark-400 text-sm mt-1">Search engine optimization analysis</p></div>
        <Link to={`/projects/${id}`} className="text-sm text-primary-400 hover:text-primary-300">← Back</Link>
      </div>
      {data ? (
        <>
          <div className="glass-card p-8 text-center"><div className="text-5xl font-bold gradient-text mb-2">{data.score}/100</div>
            <p className="text-dark-400">SEO Score · {data.totalIssues} issues</p></div>
          {data.issues?.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Issues</h2>
              <div className="space-y-2">
                {data.issues.map((issue, i) => (
                  <div key={i} className="p-3 bg-dark-800/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${issue.severity === 'high' ? 'badge-high' : issue.severity === 'medium' ? 'badge-medium' : 'badge-low'}`}>{issue.severity}</span>
                    </div>
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
        <div className="glass-card p-12 text-center"><HiOutlineMagnifyingGlass className="w-12 h-12 text-dark-600 mx-auto mb-3" /><p className="text-dark-400 text-sm">No SEO data. Run analysis first.</p></div>
      )}
    </div>
  );
};

export default SEOPage;
