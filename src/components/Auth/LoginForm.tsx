import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useActivityLog } from '../../hooks/useActivityLog';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword, onRegister }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { logActivity } = useActivityLog();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        logActivity('login', 'User logged in successfully');
        // Navigation will be handled by the main App component
      } else {
        setError(t('auth.loginError'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.username')}
        </label>
        <div className="relative">
          <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('auth.password')}
        </label>
        <div className="relative">
          <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        {loading ? t('common.loading') : t('auth.loginButton')}
      </button>

      <div className="flex justify-between text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-purple-600 hover:text-purple-700"
        >
          {t('auth.forgotPassword')}
        </button>
        <button
          type="button"
          onClick={onRegister}
          className="text-purple-600 hover:text-purple-700"
        >
          {t('auth.register')}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;