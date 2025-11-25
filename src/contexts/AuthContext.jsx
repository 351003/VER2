import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      let userData;
      
      if (email === 'admin@example.com' && password === 'password') {
        userData = {
          id: 1,
          name: 'Nguyễn Văn Admin',
          email: 'admin@example.com',
          role: 'admin',
          avatar: null,
          permissions: [
            'all',
          
            'manage_users', 'view_team_reports', 'view_admin'
          ]//'create_project', 'edit_project', 'delete_project','create_team', 'edit_team', 'delete_team',
        };
      } else if (email === 'user@example.com' && password === 'password') {
        userData = {
          id: 2,
          name: 'Trần Văn User',
          email: 'user@example.com',
          role: 'user',
          avatar: null,
          permissions: [
            'view_tasks', 'create_tasks', 'edit_own_tasks', 'delete_own_tasks',
            'view_projects', 'view_teams', 'view_calendar', 'view_own_reports'
          ]
        };
      } else if (email === 'manager@example.com' && password === 'password') {
        userData = {
          id: 3,
          name: 'Lê Thị Manager',
          email: 'manager@example.com',
          role: 'manager',
          avatar: null,
          permissions: [
            'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks',
            'view_projects', 'create_projects', 'edit_projects', 'view_teams',
            'create_teams', 'edit_teams', 'create_calendar', 'view_calendar', 'view_team_reports',
            'manage_team_tasks'
          ]
        };
      } else {
        return { success: false, message: 'Email hoặc mật khẩu không đúng!' };
      }

      const token = 'mock-jwt-token-' + userData.id;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Đăng nhập thất bại!' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.permissions?.includes('all')) return true;
    return user.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};