import React from 'react';
import { Card, Tag, Dropdown, Avatar, Tooltip, Space } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FlagOutlined,
  MenuOutlined,
} from '@ant-design/icons';

const TaskCard = ({ task, onEdit, onDelete, showStatusTag = false }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'blue'
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'default',
      'in-progress': 'processing',
      done: 'success',
      backlog: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      todo: 'Chưa bắt đầu',
      'in-progress': 'Đang thực hiện',
      done: 'Hoàn thành',
      backlog: 'Tồn đọng'
    };
    return statusMap[status] || status;
  };

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Chỉnh sửa',
      onClick: () => onEdit(task)
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Xóa',
      danger: true,
      onClick: () => onDelete(task.id)
    }
  ];

  return (
    <Card
      size="small"
      style={{ 
        marginBottom: 12,
        borderLeft: `4px solid ${getStatusColor(task.status) === 'processing' ? '#1890ff' : 
          getStatusColor(task.status) === 'success' ? '#52c41a' : 
          getStatusColor(task.status) === 'warning' ? '#faad14' : '#d9d9d9'}`,
        cursor: 'grab',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
      styles={{
        body: {
          padding: '12px',
        }
      }}
    >
      <div>
        {/* Drag Handle - Entire card is draggable but we show a handle */}
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          opacity: 0.5,
          cursor: 'grab',
        }}>
          <MenuOutlined style={{ fontSize: '12px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: '14px',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {task.title}
            </h4>
          </div>
          
          {/* Status Tag - Hiển thị trong view List */}
          {showStatusTag && (
            <Tag 
              color={getStatusColor(task.status)} 
              style={{ 
                marginLeft: 8, 
                fontSize: '10px',
                fontWeight: '500'
              }}
            >
              {getStatusText(task.status)}
            </Tag>
          )}
        </div>
        
        {task.description && (
          <p style={{ 
            color: '#666', 
            fontSize: '12px', 
            marginBottom: 12,
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {task.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          <Space size="small">
            {task.assignee ? (
              <Tooltip title={task.assignee.name}>
                <Avatar size="small" src={task.assignee.avatar} icon={<UserOutlined />} />
              </Tooltip>
            ) : (
              <Tag icon={<UserOutlined />} color="default" style={{ fontSize: '10px', margin: 0 }}>
                Chưa PC
              </Tag>
            )}
            
            <Tag color={getPriorityColor(task.priority)} style={{ margin: 0, fontSize: '10px' }}>
              <FlagOutlined /> {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
            </Tag>
          </Space>

          <Space size="small">
            {task.dueDate && (
              <Tooltip title={`Hạn: ${task.dueDate}`}>
                <Tag 
                  icon={<ClockCircleOutlined />} 
                  color={new Date(task.dueDate) < new Date() ? 'red' : 'default'}
                  style={{ fontSize: '10px', margin: 0 }}
                >
                  {task.dueDate}
                </Tag>
              </Tooltip>
            )}
            
            {/* Status Tag alternative position - khi không showStatusTag */}
            {!showStatusTag && (
              <Tag 
                color={getStatusColor(task.status)} 
                style={{ fontSize: '10px', margin: 0 }}
              >
                {getStatusText(task.status)}
              </Tag>
            )}
          </Space>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <Space size={[0, 4]} wrap>
              {task.tags.map(tag => (
                <Tag key={tag} color="blue" style={{ fontSize: '9px', margin: 0, padding: '0 4px' }}>
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginTop: 8,
          gap: 8
        }}>
          <Tooltip title="Chỉnh sửa">
            <EditOutlined 
              onClick={() => onEdit(task)} 
              style={{ color: '#1890ff', cursor: 'pointer' }}
            />
          </Tooltip>
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <MoreOutlined style={{ cursor: 'pointer' }} />
          </Dropdown>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;