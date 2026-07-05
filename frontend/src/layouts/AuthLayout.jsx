import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineBugAnt } from 'react-icons/hi2';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-dark-900 via-primary-900/20 to-dark-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow animate-delay-200"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-violet-500 rounded-xl flex items-center justify-center">
                <HiOutlineBugAnt className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">BugFinder</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              AI-Powered Website<br />
              <span className="gradient-text">Analysis Platform</span>
            </h1>
            <p className="text-dark-300 text-lg leading-relaxed max-w-md">
              Detect bugs, optimize performance, and generate professional reports 
              for your web projects with intelligent automation.
            </p>
            <div className="mt-12 space-y-4">
              {['Automated bug detection', 'Performance optimization', 'Security scanning', 'AI-powered suggestions'].map((feature, i) => (
                <motion.div key={feature} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                  </div>
                  <span className="text-dark-200 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
