import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useActivityLog } from '../hooks/useActivityLog';
import { format } from 'date-fns';
import { Activity, Search, Filter, Calendar } from 'lucide-react';

const ActivityLogPage: React.FC = () => {
  const { t } = useTranslation();
  const { activities } = useActivityLog();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = !filterAction || activity.action === filterAction;
    const matchesDate = !filterDate || activity.timestamp.startsWith(filterDate);
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const uniqueActions = [...new Set(activities.map(a => a.action))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('activityLog.title')}</h1>
        <p className="text-gray-600">Track all user actions and system activities</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {t(`activityLog.actions.${action}`)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterAction('');
              setFilterDate('');
            }}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span>{t('common.clearAll')}</span>
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('activityLog.timestamp')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('activityLog.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('activityLog.action')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('activityLog.details')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No activities found
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(activity.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {activity.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        activity.action.includes('create') ? 'bg-green-100 text-green-800' :
                        activity.action.includes('update') ? 'bg-blue-100 text-blue-800' :
                        activity.action.includes('delete') ? 'bg-red-100 text-red-800' :
                        activity.action.includes('login') ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(`activityLog.actions.${activity.action}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {activity.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredActivities.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>Showing {filteredActivities.length} of {activities.length} activities</span>
        </div>
      )}
    </div>
  );
};

export default ActivityLogPage;