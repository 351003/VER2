// src/components/Notifications/NotificationBell.jsx
import React, { useState } from 'react';
import { Badge, Dropdown, Button, Tooltip } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleBellClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const notificationDropdown = (
    <div style={{ width: 400 }}>
      <NotificationList 
        onClose={() => setDropdownVisible(false)}
      />
    </div>
  );

  return (
    <Dropdown
      overlay={notificationDropdown}
      trigger={['click']}
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
      placement="bottomRight"
      overlayStyle={{ 
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        borderRadius: 8
      }}
    >
      <Tooltip title="Thông báo">
        <Badge 
          count={5} 
          size="small" 
          offset={[-5, 5]}
          style={{ 
            cursor: 'pointer',
          }}
        >
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18, color: '#000' }} />}
            onClick={handleBellClick}
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
  );
};

export default NotificationBell;