import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

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
    const savedUsers = localStorage.getItem('permitSystemUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with default admin user
      const defaultAdmin: User = {
        id: '1',
        username: 'admin',
        password: 'Admin123!',
        email: 'admin@example.com',
        firstName: 'System',
        lastName: 'Administrator',
        region: ['headquarters'],
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      setUsers([defaultAdmin]);
      localStorage.setItem('permitSystemUsers', JSON.stringify([defaultAdmin]));
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('permitSystemUsers', JSON.stringify(updatedUsers));
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
    if (users.some(u => u.username === userData.username || u.email === userData.email)) {
      return false;
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      role: 'observer',
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    return true;
  };

  const resetPassword = async (username: string, oldPassword: string, newPassword: string): Promise<boolean> => {
    const userIndex = users.findIndex(u => u.username === username && u.password === oldPassword);
    if (userIndex !== -1) {
      const updatedUsers = [...users];
      updatedUsers[userIndex].password = newPassword;
      saveUsers(updatedUsers);
      return true;
    }
    return false;
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    saveUsers(updatedUsers);
    
    if (user && user.id === userId) {
      const updatedCurrentUser = { ...user, ...updates };
      setUser(updatedCurrentUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
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