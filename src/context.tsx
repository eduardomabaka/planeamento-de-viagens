import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Notification } from './types';
import { authApi, notificationsApi } from './api';

type Theme = 'light' | 'dark';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  user: User | null;
  theme: Theme;
  notifications: Notification[];
  unreadCount: number;
  toasts: Toast[];
  login: (email: string, password: string) => Promise<User>;
  register: (nome: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: (u: User) => void;
  toggleTheme: () => void;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  showToast: (type: Toast['type'], message: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authApi.currentUser());
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('tripplanner_theme');
    return (saved as Theme) || 'light';
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tripplanner_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      const interval = setInterval(refreshNotifications, 15000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user?.id]);

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const list = await notificationsApi.listByUser(user.id);
      setNotifications(list);
    } catch { /* noop */ }
  };

  const markNotificationRead = async (id: number) => {
    await notificationsApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const showToast = (type: Toast['type'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const login = async (email: string, password: string) => {
    const u = await authApi.login(email, password);
    setUser(u);
    return u;
  };

  const register = async (nome: string, email: string, password: string) => {
    const u = await authApi.register(nome, email, password);
    setUser(u);
    return u;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <AppContext.Provider value={{
      user, theme, notifications, unreadCount, toasts,
      login, register, logout, setUser, toggleTheme,
      refreshNotifications, markNotificationRead, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
