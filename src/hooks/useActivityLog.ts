import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityLog } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // جلب السجلات من Supabase
    const fetchActivities = async () => {
      const { data, error } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(1000);
      if (!error && data) {
        setActivities(data as ActivityLog[]);
      }
    };
    fetchActivities();
  }, []);

    // حذف دالة الحفظ المحلي

  const logActivity = (action: string, details: string) => {
    if (!user) return;
    let translatedDetails = details;
    // ...existing code for translation...
      const newActivity: ActivityLog = {
        id: crypto.randomUUID(),
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        action,
        details: translatedDetails,
        timestamp: new Date().toISOString(),
        ip: 'localhost'
      };
    // حفظ السجل في Supabase
    supabase.from('activity_logs').insert([newActivity]);
    setActivities([newActivity, ...activities].slice(0, 1000));
  };

  return { activities, logActivity };
};