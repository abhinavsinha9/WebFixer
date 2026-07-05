import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, email: user?.email, company: user?.company || '', role: user?.jobRole || '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', data);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>

      <div className="glass-card p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-4xl font-bold text-white shadow-glow">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-dark-400">{user?.email}</p>
            <span className="inline-block mt-2 badge bg-primary-500/20 text-primary-400 border border-primary-500/30">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Full Name</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type="text" {...register('name', { required: 'Name is required' })} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Email</label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type="email" {...register('email', { required: 'Email is required' })} className="input-field pl-10 bg-dark-800/50" readOnly />
              </div>
              <p className="text-xs text-dark-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Company (Optional)</label>
              <input type="text" {...register('company')} className="input-field" placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Job Role (Optional)</label>
              <input type="text" {...register('role')} className="input-field" placeholder="e.g. Senior Developer" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-dark-700/50 flex justify-end">
            <button type="submit" disabled={loading} className="gradient-btn px-6">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card p-6 border-red-500/20">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-dark-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
