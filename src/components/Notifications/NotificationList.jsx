// src/components/Notifications/NotificationList.jsx
import React from 'react';
import {
  List,
  Button,
  Tag,
  Empty,
  Divider,
  Space,
  Typography,
  Switch,
  notification
} from 'antd';
import {
  CheckOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  MessageOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { useNotifications } from '../../contexts/NotificationContext';

const { Text, Title } = Typography;

const NotificationList = ({ onClose }) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPushPermission,
    testNotification
  } = useNotifications();

  const getNotificationIcon = (type) => {
    const icons = {
      task: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
      deadline: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      urgent: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      project: <TeamOutlined style={{ color: '#52c41a' }} />,
      system: <MessageOutlined style={{ color: '#722ed1' }} />,
      meeting: <TeamOutlined style={{ color: '#eb2f96' }} />
    };
    return icons[type] || <CheckCircleOutlined />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      task: 'blue',
      deadline: 'orange',
      urgent: 'red',
      project: 'green',
      system: 'purple',
      meeting: 'pink'
    };
    return colors[type] || 'default';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handlePushNotificationToggle = async (enabled) => {
    if (enabled) {
      const granted = await requestPushPermission();
      if (!granted) {
        notification.warning({
          message: 'Không thể kích hoạt Push Notifications'
        });
      }
    }
  };

  const handleTestNotification = (type) => {
    testNotification(type);
    notification.success({
      message: 'Đã gửi thông báo test',
      description: `Loại: ${type}`,
      duration: 2
    });
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div style={{ background: 'white', borderRadius: 8 }}>
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Title level={5} style={{ margin: 0 }}>Thông báo</Title>
        <Space>
          {unreadNotifications.length > 0 && (
            <Button 
              type="link" 
              size="small" 
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </Space>
      </div>

      {/* Quick Test Buttons */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Space wrap size="small" style={{ width: '100%', justifyContent: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Test:</Text>
          <Button 
            size="small" 
            type="dashed"
            icon={<ExperimentOutlined />}
            onClick={() => handleTestNotification('task')}
          >
            Task
          </Button>
          <Button 
            size="small" 
            type="dashed"
            onClick={() => handleTestNotification('deadline')}
          >
            Deadline
          </Button>
          <Button 
            size="small" 
            type="dashed"
            onClick={() => handleTestNotification('project')}
          >
            Project
          </Button>
        </Space>
      </div>

      {/* Push Notification Settings */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Push Notifications</Text>
          <Switch 
            size="small" 
            onChange={handlePushNotificationToggle}
          />
        </Space>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        <List
          dataSource={notifications}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có thông báo"
              />
            )
          }}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                background: item.read ? 'white' : '#f0f8ff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderLeft: item.read ? 'none' : '3px solid #1890ff'
              }}
              onClick={() => {
                if (!item.read) markAsRead(item._id);
                if (onClose) onClose();
                notification.info({
                  message: 'Chuyển hướng...',
                  description: `Đang mở ${item.link}`,
                  duration: 2
                });
              }}
              actions={[
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(item._id);
                  }}
                  disabled={item.read}
                />,
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item._id);
                  }}
                />
              ]}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(item.type)}
                title={
                  <Space size="small">
                    <Text 
                      style={{ 
                        fontSize: 14, 
                        fontWeight: item.read ? 400 : 600,
                        color: item.read ? '#666' : '#000'
                      }}
                    >
                      {item.title}
                    </Text>
                    <Tag 
                      color={getNotificationColor(item.type)} 
                      size="small"
                    >
                      {item.type}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text 
                      style={{ 
                        fontSize: 13, 
                        display: 'block',
                        marginBottom: 4,
                        lineHeight: 1.4
                      }}
                    >
                      {item.message}
                    </Text>
                    <Text 
                      type="secondary" 
                      style={{ fontSize: 11 }}
                    >
                      {formatTime(item.createdAt)}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>

      {/* Footer */}
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: 12, textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {notifications.length} thông báo • {unreadNotifications.length} chưa đọc
        </Text>
      </div>
    </div>
  );
};

export default NotificationList;