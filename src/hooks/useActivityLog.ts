import { useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const { user } = useAuth();

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

    const newActivity: ActivityLog = {
      id: Date.now().toString(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: 'localhost' // In a real app, you'd get the actual IP
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 1000); // Keep last 1000 activities
    saveActivities(updatedActivities);
  };

  return { activities, logActivity };
};