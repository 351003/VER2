import React from 'react';
import { Card, Tag, Progress, Avatar, Space, Tooltip, Dropdown } from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProjectCard = ({ project, onView, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();

  // Xử lý click vào card (chỉ view detail)
  const handleCardClick = (e) => {
    // Ngăn chặn event bubbling khi click vào các phần tử khác
    if (e.target.closest('.ant-card-actions') || 
        e.target.closest('.ant-dropdown-trigger') ||
        e.target.closest('.ant-btn')) {
      return;
    }
    onView(project);
  };
  const getStatusColor = (status) => {
    const colors = {
      'not-started': 'default',
      'in-progress': 'processing',
      'on-hold': 'warning',
      'completed': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'not-started': 'Chưa bắt đầu',
      'in-progress': 'Đang thực hiện',
      'on-hold': 'Tạm dừng',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'blue',
      'medium': 'orange',
      'high': 'red'
    };
    return colors[priority] || 'default';
  };

  const calculateProgress = (project) => {
    if (!project.totalTasks || project.totalTasks === 0) return 0;
    return Math.round((project.completedTasks / project.totalTasks) * 100);
  };

  const menuItems = [];
  
  // Chỉ thêm delete nếu có quyền và có hàm onDelete
  if (onDelete && hasPermission('delete_project')) {
    menuItems.push(
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Xóa dự án',
        danger: true,
        onClick: (e) => {
          e.stopPropagation();
          onDelete(project.id);
        }
      }
    );
  }

  const actions = [
    <Tooltip title="Xem chi tiết">
      <EyeOutlined 
        key="view" 
        onClick={(e) => {
          e.stopPropagation();
          onView(project);
        }} 
      />
    </Tooltip>,
  ];

  // Chỉ thêm edit action nếu có quyền
  if (onEdit && hasPermission('edit_project')) {
    actions.push(
      <Tooltip title="Chỉnh sửa">
        <EditOutlined 
          key="edit" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(project);
          }} 
        />
      </Tooltip>
    );
  }

  // Chỉ thêm dropdown nếu có menu items (ngoài view)
  if (menuItems.length > 1) {
    actions.push(
      <Dropdown 
        menu={{ items: menuItems }} 
        trigger={['click']}
        onClick={(e) => e.stopPropagation()}
      >
        <MoreOutlined 
          key="more" 
          onClick={(e) => e.stopPropagation()} 
        />
      </Dropdown>
    );
  }

  const progress = calculateProgress(project);

  return (
    <Card
      style={{
        marginBottom: 16,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `1px solid ${
          project.status === 'completed' ? '#52c41a' : 
          project.status === 'in-progress' ? '#1890ff' : 
          project.status === 'on-hold' ? '#faad14' : '#d9d9d9'
        }`
      }}
      hoverable
      onClick={handleCardClick}
      actions={actions}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            marginBottom: 8,
            fontSize: '16px',
            fontWeight: 600
          }}>
            {project.name}
          </h3>
          <p style={{ 
            color: '#666', 
            fontSize: '13px',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {project.description}
          </p>
        </div>
        
        <Space direction="vertical" align="end" size={4}>
          <Tag color={getStatusColor(project.status)}>
            {getStatusText(project.status)}
          </Tag>
          <Tag color={getPriorityColor(project.priority)}>
            {project.priority === 'high' ? 'Cao' : project.priority === 'medium' ? 'TB' : 'Thấp'}
          </Tag>
        </Space>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '12px', color: '#666' }}>Tiến độ</span>
          <span style={{ fontSize: '12px', fontWeight: 500 }}>{progress}%</span>
        </div>
        <Progress 
          percent={progress} 
          size="small"
          strokeColor={
            progress === 100 ? '#52c41a' :
            progress >= 70 ? '#1890ff' :
            progress >= 30 ? '#faad14' : '#ff4d4f'
          }
        />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Space size="small">
          <TeamOutlined style={{ color: '#666', fontSize: '12px' }} />
          <span style={{ fontSize: '12px', color: '#666' }}>
            {project.completedTasks || 0}/{project.totalTasks || 0} công việc
          </span>
        </Space>
        
        {project.dueDate && (
          <Space size="small">
            <CalendarOutlined style={{ color: '#666', fontSize: '12px' }} />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {project.dueDate}
            </span>
          </Space>
        )}
      </div>

      {/* Team Members */}
      {project.teamMembers && project.teamMembers.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Avatar.Group 
            size="small" 
            maxCount={3} 
            maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
          >
            {project.teamMembers.map((member, index) => (
              <Tooltip key={index} title={member.name} placement="top">
                <Avatar src={member.avatar} icon={<UserOutlined />} />
              </Tooltip>
            ))}
          </Avatar.Group>
          
          <span style={{ fontSize: '11px', color: '#999' }}>
            {project.teamMembers.length} thành viên
          </span>
        </div>
      )}
    </Card>
  );
};

export default ProjectCard;