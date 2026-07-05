import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiOutlineEnvelope } from 'react-icons/hi2';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <HiOutlineEnvelope className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
        <p className="text-dark-400 text-sm mb-6">We've sent a password reset link to your email address.</p>
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium text-sm">Back to login</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Forgot password?</h2>
      <p className="text-dark-400 text-sm mb-8">Enter your email and we'll send a reset link</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-1.5">Email</label>
          <div className="relative">
            <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input type="email" {...register('email', { required: 'Email is required' })}
              className="input-field pl-10" placeholder="you@example.com" />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="gradient-btn w-full py-3">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : 'Send Reset Link'}
        </button>
      </form>
      <p className="text-center text-sm text-dark-400 mt-6">
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Back to login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
