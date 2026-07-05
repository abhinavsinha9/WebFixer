import { Link } from 'react-router-dom';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4">
      <div className="glass-card p-12 text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>
        <HiOutlineExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-dark-200 mb-4">Page Not Found</h2>
        <p className="text-dark-400 text-sm mb-8 leading-relaxed">
          We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
        </p>
        <Link to="/dashboard" className="gradient-btn px-8 inline-block">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
