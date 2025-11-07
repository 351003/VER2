import React, { useState } from 'react';
import { 
  Layout, 
  Dropdown, 
  Avatar, 
  Space, 
  Badge, 
  theme, 
  Button, 
  Tooltip 
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationList from '../Notifications/NotificationList';

const { Header: AntHeader } = Layout;

const Header = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [notificationDropdownVisible, setNotificationDropdownVisible] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const getUserMenuItems = () => {
    const items = [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Hồ sơ',
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Cài đặt',
      },
    ];

    if (user?.role === 'admin') {
      items.unshift({
        key: 'admin',
        icon: <CrownOutlined />,
        label: 'Quản trị',
        style: { color: '#ff4d4f' }
      });
    }

    items.push(
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
      }
    );

    return items;
  };

  const getRoleText = (role) => {
    const roleMap = {
      'admin': 'Quản trị viên',
      'manager': 'Quản lý',
      'user': 'Người dùng',
      
    };
    return roleMap[role] || 'Người dùng';
  };
  const notificationDropdown = (
    <div style={{ width: 400 }}>
      <NotificationList 
        onClose={() => setNotificationDropdownVisible(false)}
      />
    </div>
  );

  return (
    <AntHeader
      style={{
        position: 'sticky',     // 🟢 Giữ header cố định khi cuộn
        top: 0,                 // 🟢 Dính sát mép trên
        zIndex: 1000, 
        padding: '0 24px',
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: 'trigger',
          onClick: onToggle,
          style: { fontSize: 18, cursor: 'pointer' },
        })}
      </div>

      <Space size="large">
        {/* Notification Bell */}
        <Dropdown
          overlay={notificationDropdown}
          trigger={['click']}
          open={notificationDropdownVisible}
          onOpenChange={setNotificationDropdownVisible}
          placement="bottomRight"
          overlayStyle={{ 
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            borderRadius: 8
          }}
        >
          <Tooltip title="Thông báo">
            <Badge 
              count={unreadCount} 
              size="small" 
              offset={[-5, 5]}
              style={{ 
                cursor: 'pointer',
              }}
            >
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18, color: '#000' }} />}
                onClick={() => setNotificationDropdownVisible(!notificationDropdownVisible)}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Badge>
          </Tooltip>
        </Dropdown>
        
        {/* User Profile Dropdown */}
        <Dropdown
          menu={{
            items: getUserMenuItems(),
            onClick: ({ key }) => {
              if (key === 'profile') navigate('/profile');
              else if (key === 'settings') navigate('/profile');
              else if (key === 'admin') navigate('/admin');
              else if (key === 'logout') logout();
            }
          }}
          placement="bottomRight"
        >
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar 
              size="default" 
              icon={<UserOutlined />} 
              src={user?.avatar}
              style={{
                border: user?.role === 'admin' ? '2px solid #ff4d4f' : 'none'
              }}
            />
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-start',
              lineHeight: 1.2,
              gap: 2
            }}>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 600,
                color: '#000'
              }}>
                {user?.name || user?.email || 'Người dùng'}
              </div>
              <div style={{ 
                fontSize: 12, 
                color: user?.role === 'admin' ? '#ff4d4f' : '#666',
                fontWeight: user?.role === 'admin' ? 500 : 400
              }}>
                {getRoleText(user?.role)}
              </div>
            </div>
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;