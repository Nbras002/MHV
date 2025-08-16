import { useState, useEffect } from 'react';
import { Permit, Material } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useActivityLog } from './useActivityLog';

export const usePermits = () => {
  const [permits, setPermits] = useState<Permit[]>([]);
  const { user } = useAuth();
  const { logActivity } = useActivityLog();

  useEffect(() => {
    const savedPermits = localStorage.getItem('permits');
    if (savedPermits) {
      setPermits(JSON.parse(savedPermits));
    }
  }, []);

  const savePermits = (updatedPermits: Permit[]) => {
    setPermits(updatedPermits);
    localStorage.setItem('permits', JSON.stringify(updatedPermits));
  };

  const addPermit = (permitData: Omit<Permit, 'id' | 'createdAt' | 'createdBy' | 'canReopen'>) => {
    const newPermit: Permit = {
      ...permitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '',
      canReopen: true
    };

    const updatedPermits = [...permits, newPermit];
    savePermits(updatedPermits);
    
    logActivity('create_permit', `Created permit ${newPermit.permitNumber}`);
    return newPermit;
  };

  const updatePermit = (permitId: string, updates: Partial<Permit>) => {
    const updatedPermits = permits.map(permit => 
      permit.id === permitId ? { ...permit, ...updates } : permit
    );
    savePermits(updatedPermits);
    
    logActivity('update_permit', `Updated permit ${updates.permitNumber || permitId}`);
  };

  const deletePermit = (permitId: string) => {
    const permit = permits.find(p => p.id === permitId);
    const updatedPermits = permits.filter(permit => permit.id !== permitId);
    savePermits(updatedPermits);
    
    logActivity('delete_permit', `Deleted permit ${permit?.permitNumber || permitId}`);
  };

  const closePermit = (permitId: string) => {
    const permit = permits.find(p => p.id === permitId);
    if (permit && user) {
      const updates = {
        closedBy: user.id,
        closedByName: `${user.firstName} ${user.lastName} [${user.username}]`,
        closedAt: new Date().toISOString(),
        canReopen: true
      };
      
      updatePermit(permitId, updates);
      logActivity('close_permit', `Closed permit ${permit.permitNumber}`);
    }
  };

  const reopenPermit = (permitId: string) => {
    const permit = permits.find(p => p.id === permitId);
    if (permit && permit.closedAt) {
      const closedTime = new Date(permit.closedAt);
      const now = new Date();
      const hoursPassed = (now.getTime() - closedTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursPassed <= 1) {
        const updates = {
          closedBy: undefined,
          closedByName: undefined,
          closedAt: undefined,
          canReopen: true
        };
        
        updatePermit(permitId, updates);
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