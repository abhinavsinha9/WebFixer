import { motion } from 'framer-motion';
import { HiOutlineChartBar, HiOutlineBugAnt, HiOutlineFolder, HiOutlineShieldCheck, HiOutlineBolt, HiOutlineEye, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

const Analytics = () => {
  const demoData = {
    overview: [
      { icon: HiOutlineFolder, label: 'Total Projects', value: '12', trend: '+3', color: 'from-primary-500 to-blue-500' },
      { icon: HiOutlineBugAnt, label: 'Total Bugs', value: '247', trend: '-18', color: 'from-red-500 to-rose-500' },
      { icon: HiOutlineShieldCheck, label: 'Resolved', value: '189', trend: '+24', color: 'from-emerald-500 to-green-500' },
      { icon: HiOutlineChartBar, label: 'Avg Score', value: '78', trend: '+5', color: 'from-violet-500 to-purple-500' },
    ],
    trends: [
      { month: 'Jan', bugs: 45, resolved: 38, score: 72 }, { month: 'Feb', bugs: 52, resolved: 48, score: 74 },
      { month: 'Mar', bugs: 38, resolved: 35, score: 76 }, { month: 'Apr', bugs: 42, resolved: 40, score: 78 },
      { month: 'May', bugs: 35, resolved: 33, score: 80 }, { month: 'Jun', bugs: 28, resolved: 27, score: 82 },
    ],
    categories: [
      { name: 'Performance', count: 42, color: 'bg-amber-500' }, { name: 'Accessibility', count: 38, color: 'bg-blue-500' },
      { name: 'Security', count: 28, color: 'bg-red-500' }, { name: 'SEO', count: 24, color: 'bg-violet-500' },
      { name: 'Code Quality', count: 56, color: 'bg-emerald-500' }, { name: 'Other', count: 59, color: 'bg-slate-500' },
    ]
  };

  const maxBugs = Math.max(...demoData.trends.map(t => t.bugs));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {demoData.overview.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
              <item.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-dark-400">{item.label}</span>
              <span className={`text-xs font-medium ${item.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{item.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bug Trends Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Bug Trends</h2>
          <div className="flex items-end gap-4 h-48">
            {demoData.trends.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end" style={{ height: '160px' }}>
                  <div className="flex-1 bg-red-500/30 rounded-t" style={{ height: `${(t.bugs / maxBugs) * 100}%` }}></div>
                  <div className="flex-1 bg-emerald-500/30 rounded-t" style={{ height: `${(t.resolved / maxBugs) * 100}%` }}></div>
                </div>
                <span className="text-xs text-dark-500">{t.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500/30 rounded"></div><span className="text-xs text-dark-400">Found</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500/30 rounded"></div><span className="text-xs text-dark-400">Resolved</span></div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Issues by Category</h2>
          <div className="space-y-3">
            {demoData.categories.map((cat, i) => {
              const maxCount = Math.max(...demoData.categories.map(c => c.count));
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-dark-200">{cat.name}</span>
                    <span className="text-sm font-medium text-dark-300">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.count / maxCount) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${cat.color}`}></motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
