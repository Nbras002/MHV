import { useState, useEffect } from 'react';
import { Permit } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useActivityLog } from './useActivityLog';
import { supabase } from '../lib/supabase';

export const usePermits = () => {
  const [permits, setPermits] = useState<Permit[]>([]);
  const { user } = useAuth();
  const { logActivity } = useActivityLog();

  useEffect(() => {
    // جلب التصاريح من Supabase
    const fetchPermits = async () => {
      const { data, error } = await supabase.from('permits').select('*');
      if (!error && data) {
        setPermits(data as Permit[]);
      }
    };
    fetchPermits();
  }, []);

  // حذف دالة الحفظ المحلي

  const addPermit = async (permitData: Omit<Permit, 'id' | 'createdAt' | 'createdBy' | 'canReopen'>) => {
    const newPermit: Permit = {
      ...permitData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '',
      canReopen: true
    };
    const { data, error } = await supabase.from('permits').insert([newPermit]).select();
    if (!error && data && data[0]) {
      setPermits([...permits, data[0] as Permit]);
      logActivity('create_permit', `Created permit ${data[0].permitNumber}`);
      return data[0] as Permit;
    }
    return null;
  };

  const updatePermit = async (permitId: string, updates: Partial<Permit>) => {
    const { data, error } = await supabase.from('permits').update(updates).eq('id', permitId).select();
    if (!error && data) {
      setPermits(permits.map((permit: Permit) => permit.id === permitId ? { ...permit, ...updates } : permit));
      logActivity('update_permit', `Updated permit ${updates.permitNumber || permitId}`);
    }
  };

  const deletePermit = async (permitId: string) => {
    const permit = permits.find((p: Permit) => p.id === permitId);
    const { error } = await supabase.from('permits').delete().eq('id', permitId);
    if (!error) {
      setPermits(permits.filter((permit: Permit) => permit.id !== permitId));
      logActivity('delete_permit', `Deleted permit ${permit?.permitNumber || permitId}`);
    }
  };

  const closePermit = async (permitId: string) => {
    const permit = permits.find((p: Permit) => p.id === permitId);
    if (permit && user) {
      const updates: Partial<Permit> = {
        closedBy: user.id,
        closedByName: `${user.firstName} ${user.lastName} [${user.username}]`,
        closedAt: new Date().toISOString(),
        canReopen: true
      };
      await updatePermit(permitId, updates);
      logActivity('close_permit', `Closed permit ${permit.permitNumber}`);
    }
  };

  const reopenPermit = async (permitId: string) => {
    const permit = permits.find((p: Permit) => p.id === permitId);
    if (permit && permit.closedAt) {
      const closedTime = new Date(permit.closedAt);
      const now = new Date();
      const hoursPassed = (now.getTime() - closedTime.getTime()) / (1000 * 60 * 60);
      if (hoursPassed <= 1) {
        const updates: Partial<Permit> = {
          closedBy: undefined,
          closedByName: undefined,
          closedAt: undefined,
          canReopen: true
        };
        await updatePermit(permitId, updates);
        logActivity('reopen_permit', `Reopened permit ${permit.permitNumber}`);
        return true;
      }
    }
    return false;
  };

  const generatePermitNumber = () => {
    const year = new Date().getFullYear();
    const count = permits.length + 1;
    return `P${year}${count.toString().padStart(6, '0')}`;
  };

  return {
    permits,
    addPermit,
    updatePermit,
    deletePermit,
    closePermit,
    reopenPermit,
    generatePermitNumber
  };
};