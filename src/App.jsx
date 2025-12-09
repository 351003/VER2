import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import PersonalTasks from './pages/Tasks/PersonalTasks';
import TeamTasks from './pages/Tasks/TeamTasks';
import Projects from './pages/Projects/Projects';
import ProjectDetail from './pages/Projects/ProjectDetail';
import Teams from './pages/Teams/Teams';
import TeamDetail from './pages/Teams/TeamDetail';
import Calendar from './pages/Calendar/Calendar';
import Reports from './pages/Reports/Reports';
import PersonalReports from './pages/Reports/PersonalReports';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Profile from './pages/Profile/Profile';

// ✅ Route bảo vệ
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  // ❌ Chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Nếu là admin mà đang không ở /admin → chuyển hướng
  if (user.role === 'admin' && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  // ✅ Nếu không phải admin mà đang cố vào /admin → chặn
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ✅ Route riêng cho admin
const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />

                {/* Tasks */}
                <Route path="tasks/personal" element={<PersonalTasks />} />
                <Route path="tasks/team" element={<TeamTasks />} />

                {/* Projects */}
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetail />} />

                {/* Teams */}
                <Route path="teams" element={<Teams />} />
                <Route path="teams/:id" element={<TeamDetail />} />

                {/* Calendar */}
                <Route path="calendar" element={<Calendar />} />

                {/* Reports */}
                <Route path="reports" element={<Reports />} />
                <Route path="personalreports" element={<PersonalReports />} />

                {/* ✅ Admin */}
                <Route
                  path="admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;