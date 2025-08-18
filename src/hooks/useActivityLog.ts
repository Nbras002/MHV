import { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export const useActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const savedActivities = localStorage.getItem('activityLog');
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    }
  }, []);

  const saveActivities = (updatedActivities: ActivityLog[]) => {
    setActivities(updatedActivities);
    localStorage.setItem('activityLog', JSON.stringify(updatedActivities));
  };

  const logActivity = (action: string, details: string) => {
    if (!user) return;

    // Create translated details based on action type
    let translatedDetails = details;
    
    // Extract permit number or username from details for translation
    const permitMatch = details.match(/permit (\w+)/);
    const userMatch = details.match(/user (\w+)/);
    const countMatch = details.match(/(\d+) permits?/);
    
    if (permitMatch) {
      const permitNumber = permitMatch[1];
      switch (action) {
        case 'create_permit':
          translatedDetails = t('activityLog.details.create_permit', { permitNumber });
          break;
        case 'update_permit':
          translatedDetails = t('activityLog.details.update_permit', { permitNumber });
          break;
        case 'delete_permit':
          translatedDetails = t('activityLog.details.delete_permit', { permitNumber });
          break;
        case 'close_permit':
          translatedDetails = t('activityLog.details.close_permit', { permitNumber });
          break;
        case 'reopen_permit':
          translatedDetails = t('activityLog.details.reopen_permit', { permitNumber });
          break;
      }
    } else if (userMatch) {
      const username = userMatch[1];
      switch (action) {
        case 'create_user':
          translatedDetails = t('activityLog.details.create_user', { username });
          break;
        case 'update_user':
          translatedDetails = t('activityLog.details.update_user', { username });
          break;
        case 'delete_user':
          translatedDetails = t('activityLog.details.delete_user', { username });
          break;
      }
    } else if (countMatch) {
      const count = countMatch[1];
      if (action === 'export_permits') {
        translatedDetails = t('activityLog.details.export_permits', { count });
      }
    } else {
      // Handle simple actions without parameters
      switch (action) {
        case 'login':
          translatedDetails = t('activityLog.details.login');
          break;
        case 'logout':
          translatedDetails = t('activityLog.details.logout');
          break;
        default:
          translatedDetails = details;
      }
    }
    const newActivity: ActivityLog = {
      id: Date.now().toString(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      action,
      details: translatedDetails,
      timestamp: new Date().toISOString(),
      ip: 'localhost' // In a real app, you'd get the actual IP
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 1000); // Keep last 1000 activities
    saveActivities(updatedActivities);
  };

  return { activities, logActivity };
};