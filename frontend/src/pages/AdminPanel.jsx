import { useState, useEffect } from 'react';
import { HiOutlineUsers, HiOutlineFolder, HiOutlineChartBar, HiOutlineShieldCheck, HiOutlineTrash } from 'react-icons/hi2';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
      setUsers(data.recentUsers || []);
    } catch (e) {
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('Role updated');
      fetchAdminData();
    } catch (e) { toast.error('Update failed'); }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchAdminData();
    } catch (e) { toast.error('Delete failed'); }
  };

  if (loading) return <div className="glass-card p-12 text-center animate-pulse"><div className="h-6 bg-dark-700 rounded w-48 mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.users, icon: HiOutlineUsers, color: 'text-blue-400' },
            { label: 'Total Projects', value: stats.projects, icon: HiOutlineFolder, color: 'text-emerald-400' },
            { label: 'Total Bugs', value: stats.bugs, icon: HiOutlineShieldCheck, color: 'text-red-400' },
            { label: 'Total Reports', value: stats.reports, icon: HiOutlineChartBar, color: 'text-violet-400' },
          ].map((s, i) => (
            <div key={i} className="glass-card p-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-dark-800 ${s.color}`}><s.icon className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-dark-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-dark-700/50">
          <h2 className="text-lg font-semibold text-white">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-800/50 text-dark-400">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-dark-800/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{u.name}</td>
                  <td className="px-5 py-3 text-dark-300">{u.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u._id, e.target.value)}
                      className="bg-dark-800 border border-dark-600 rounded px-2 py-1 text-xs text-dark-200"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-dark-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteUser(u._id)} className="text-dark-500 hover:text-red-400 p-1 transition-colors">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-dark-400 py-6">No users found.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
