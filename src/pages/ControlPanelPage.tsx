import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useActivityLog } from '../hooks/useActivityLog';
import { User, REGIONS, RolePermissions, DEFAULT_ROLE_PERMISSIONS } from '../types';
import { validatePassword, validateEmail } from '../utils/validation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  User as UserIcon, 
  Mail, 
  Lock, 
  // MapPin,
  Shield,
  Settings
} from 'lucide-react';

const ControlPanelPage: React.FC = () => {
  const { t } = useTranslation();
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const { logActivity } = useActivityLog();
  
  const [showForm, setShowForm] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermissions>>(DEFAULT_ROLE_PERMISSIONS);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    region: string[];
    role: 'admin' | 'manager' | 'security_officer' | 'observer';
  }>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    region: ['headquarters'],
    role: 'observer'
  });

  useEffect(() => {
    const savedPermissions = localStorage.getItem('rolePermissions');
    if (savedPermissions) {
      setRolePermissions(JSON.parse(savedPermissions));
    }
  }, []);

  const saveRolePermissions = (permissions: Record<string, RolePermissions>) => {
    setRolePermissions(permissions);
    localStorage.setItem('rolePermissions', JSON.stringify(permissions));
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setError('');
    setFormData({
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      region: ['headquarters'],
      role: 'observer'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Invalid email address');
      return;
    }

    if (!editingUser && !validatePassword(formData.password)) {
      setError(t('auth.passwordRequirements'));
      return;
    }

    try {
      if (editingUser) {
        const updates: Partial<User> = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          region: formData.region,
          role: formData.role
        };
        
        if (formData.password) {
          updates.password = formData.password;
        }
        
        updateUser(editingUser.id, updates);
        logActivity('update_user', `Updated user ${formData.username}`);
      } else {
        addUser(formData);
        logActivity('create_user', `Created user ${formData.username}`);
      }
      
      resetForm();
      alert(t('users.userSaved'));
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      region: user.region,
      role: user.role
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (userId: string, username: string) => {
    if (window.confirm(t('users.deleteConfirm'))) {
      deleteUser(userId);
      logActivity('delete_user', `Deleted user ${username}`);
      alert(t('users.userDeleted'));
    }
  };

  const toggleRegion = (region: string) => {
    if (formData.region.includes(region)) {
      setFormData({
        ...formData,
        region: formData.region.filter(r => r !== region)
      });
    } else {
      setFormData({
        ...formData,
        region: [...formData.region, region]
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('users.title')}</h1>
          <p className="text-gray-600">{t('users.subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
          <button
            onClick={() => setShowPermissionsModal(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            <Settings className="w-4 h-4" />
            <span>{t('users.managePermissions')}</span>
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>{t('users.addUser')}</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('auth.username')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  {t('auth.firstName')} / {t('auth.lastName')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  {t('auth.email')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.role')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  {t('users.regions')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  {t('users.lastLogin')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('users.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 text-center">
                    {user.username}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center hidden sm:table-cell">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center hidden md:table-cell">
                    {user.email}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'security_officer' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`roles.${user.role}`)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 text-center hidden lg:table-cell">
                    {user.region.slice(0, 2).map(region => t(`regions.${region}`)).join(', ')}
                    {user.region.length > 2 && ` +${user.region.length - 2} ${t('users.more')}`}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 text-center hidden lg:table-cell">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : t('users.never')}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-700 p-1"
                        title={t('users.editUser')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {user.id !== '1' && (
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title={t('permits.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto mx-2">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingUser ? t('users.editUser') : t('users.addUser')}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.firstName')}
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.lastName')}
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.username')}
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        minLength={3}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.email')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('users.role')}
                    </label>
                    <div className="relative">
                      <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="observer">{t('roles.observer')}</option>
                        <option value="security_officer">{t('roles.security_officer')}</option>
                        <option value="manager">{t('roles.manager')}</option>
                        <option value="admin">{t('roles.admin')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingUser ? 'New Password (leave empty to keep current)' : t('auth.password')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required={!editingUser}
                      />
                    </div>
                    {!editingUser && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t('auth.passwordRequirements')}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('users.regions')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                    {REGIONS.map(region => (
                      <label key={region} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.region.includes(region)}
                          onChange={() => toggleRegion(region)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {t(`regions.${region}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t('permits.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('permits.save')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Role Permissions Management Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto mx-2">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('users.managePermissions')}
                </h2>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(rolePermissions).map(([role, permissions]) => (
                  <div key={role} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t(`roles.${role}`)}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(permissions).map(([permission, value]) => (
                        <label key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => {
                              const updatedPermissions = {
                                ...rolePermissions,
                                [role]: {
                                  ...rolePermissions[role],
                                  [permission]: e.target.checked
                                }
                              };
                              saveRolePermissions(updatedPermissions);
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {t(`users.${permission}`)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => {
                    saveRolePermissions(DEFAULT_ROLE_PERMISSIONS);
                    alert(t('users.resetToDefault'));
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('users.resetToDefault')}
                </button>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanelPage;