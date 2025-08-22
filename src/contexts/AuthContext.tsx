import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'role'>) => Promise<boolean>;
  resetPassword: (username: string, oldPassword: string, newPassword: string) => Promise<boolean>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // جلب المستخدمين من Supabase
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) {
        setUsers(data as User[]);
      }
    };
    fetchUsers();
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
  setUsers(updatedUsers);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update user in users array
      const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u);
      saveUsers(updatedUsers);
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'role'>): Promise<boolean> => {
    // تحقق من عدم وجود مستخدم بنفس الاسم أو البريد
    const { data: existing, error: existError } = await supabase.from('users').select('*').or(`username.eq.${userData.username},email.eq.${userData.email}`);
    if (!existError && existing && existing.length > 0) {
      return false;
    }
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      role: 'observer',
      createdAt: new Date().toISOString()
    };
    const { error } = await supabase.from('users').insert([newUser]);
    if (!error) {
      setUsers([...users, newUser]);
      return true;
    }
    return false;
  };

  const resetPassword = async (username: string, oldPassword: string, newPassword: string): Promise<boolean> => {
    // تحقق من المستخدم في Supabase
    const { data, error } = await supabase.from('users').select('*').eq('username', username).eq('password', oldPassword).single();
    if (!error && data) {
      await supabase.from('users').update({ password: newPassword }).eq('id', data.id);
      return true;
    }
    return false;
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const { error } = await supabase.from('users').update(updates).eq('id', userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
      if (user && user.id === userId) {
        const updatedCurrentUser = { ...user, ...updates };
        setUser(updatedCurrentUser);
      }
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    const { error } = await supabase.from('users').insert([newUser]);
    if (!error) {
      setUsers([...users, newUser]);
    }
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      resetPassword,
      updateUser,
      users,
      addUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};