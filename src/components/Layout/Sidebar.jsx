import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  CheckCircleOutlined,
  ProjectOutlined,
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

import PermissionWrapper from '../Common/PermissionWrapper';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission } = useAuth();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [openKeys, setOpenKeys] = useState([]);
    let menuItems = [];

  // Nếu là admin
  if (user?.role === 'admin') {
    menuItems = [
      {
        key: '/admin',
        icon: <SettingOutlined />,
        label: 'Quản Trị Hệ Thống',
      },
    ];
  }
  // Nếu là manager
  else if (user?.role === 'manager') {
    menuItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
      {
        key: '/tasks/team',
        icon: <CheckCircleOutlined />,
        label: 'Công việc nhóm',
        
      },
      {
        key: '/projects',
        icon: <ProjectOutlined />,
        label: 'Dự Án',
      },
      {
        key: '/teams',
        icon: <TeamOutlined />,
        label: 'Nhóm',
      },
      {
        key: '/calendar',
        icon: <CalendarOutlined />,
        label: 'Lịch',
      },
      {
        key: '/reports',
        icon: <BarChartOutlined />,
        label: 'Báo Cáo',
      },
    ];
  }
  // Nếu là user thường
  else {
    menuItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      },
      {
        key: '/tasks',
        icon: <CheckCircleOutlined />,
        label: 'Công Việc',
        children: [
          {
            key: '/tasks/personal',
            label: 'Cá Nhân',
          },
          {
            key: '/tasks/team',
            label: 'Nhóm',
          },
        ],
      },
      {
        key: '/projects',
        icon: <ProjectOutlined />,
        label: 'Dự Án',
      },
      {
        key: '/teams',
        icon: <TeamOutlined />,
        label: 'Nhóm',
      },
      {
        key: '/calendar',
        icon: <CalendarOutlined />,
        label: 'Lịch',
      },
      {
        key: '/personalreports',
        icon: <BarChartOutlined />,
        label: 'Báo Cáo Cá Nhân',
      },
    ];
  }

    const onOpenChange = (keys) => {
        // Chỉ cho phép mở 1 dropdown tại một thời điểm
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    };
  //   // Thêm menu Reports chỉ cho manager và admin
  // if (hasPermission('view_team_reports')) {
  //   menuItems.push({
  //     key: '/reports',
  //     icon: <BarChartOutlined />,
  //     label: 'Báo Cáo',
  //   });
  // }
  // // ---  Giới hạn hiển thị nếu là admin ---
  // if (user?.role === 'admin') {
  //   menuItems = menuItems.filter(
  //     (item) =>
  //       item.key === '/dashboard' ||
  //       item.key === '/admin' ||
  //       item.key === '/reports'
  //   );
  // }
  // if (hasPermission('view_own_reports')) {
  //   menuItems.push({
  //     key: '/personalreports',
  //     icon: <BarChartOutlined />,
  //     label: 'Báo Cáo',
  //   });
  // }

  // // Thêm menu Admin chỉ cho admin
  // if (user?.role === 'admin') {
  //   menuItems.push({
  //     key: '/admin',
  //     icon: <SettingOutlined />,
  //     label: 'Quản Trị',
  //   });
  // }



  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      style={{
        background: colorBgContainer,
        boxShadow: '2px 0 6px rgba(0,21,41,0.1)',
      }}
      width={250}
    >
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 8,
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#1890ff',
          fontSize: collapsed ? 14 : 18,
          transition: 'all 0.2s'
        }}>
          {collapsed ? 'TM' : 'TaskManager'}
        </h2>
      </div>
      
      <div style={{ 
        padding: '8px 16px', 
        fontSize: 12, 
        color: '#666',
        borderBottom: '1px solid #f0f0f0'
      }}>
        👋 Chào, <strong>{user?.name}</strong>
        <div style={{ fontSize: 10, color: '#999' }}>
          {user?.role === 'admin' && '🔧 Quản trị viên'}
          {user?.role === 'manager' && '👔 Quản lý'}
          {user?.role === 'user' && '👤 Người dùng'}
        </div>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['/tasks']}
        items={menuItems}
        onClick={handleMenuClick}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        style={{ border: 'none', marginTop: 8 }}
      />
    </Sider>
  );
};

export default Sidebar;