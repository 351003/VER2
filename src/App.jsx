import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import { NotificationProvider } from './contexts/NotificationContext';
// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
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


const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
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
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
};

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
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Tasks */}
              <Route path="tasks">
                <Route path="personal" element={<PersonalTasks />} />
                <Route path="team" element={<TeamTasks />} />
              </Route>

              {/* Projects */}
              <Route path="projects">
                <Route index element={<Projects />} />
                <Route path=":id" element={<ProjectDetail />} />
              </Route>

              {/* Teams */}
              <Route path="teams">
                <Route index element={<Teams />} />
                <Route path=":id" element={<TeamDetail />} />
              </Route>

              {/* Calendar */}
              <Route path="calendar" element={<Calendar />} />

              {/* Reports */}
              <Route path="reports" element={<Reports />} />
                <Route path ="personalreports" element={<PersonalReports />} />
              {/* Admin Routes */}
              <Route path="admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
            </Route>
          </Routes>
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;