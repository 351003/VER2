// components/Projects/ProjectCard.jsx
import React, { useState } from 'react';
import { 
  Card, 
  Tag, 
  Progress, 
  Avatar, 
  Space, 
  Tooltip, 
  Dropdown, 
  Popconfirm,
  message 
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const ProjectCard = ({ 
  project, 
  onView, 
  onEdit, 
  onDelete, 
  onChangeStatus,
  onChangePriority 
}) => {
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Xử lý click vào card (chỉ view detail)
  const handleCardClick = (e) => {
    // Ngăn chặn event bubbling khi click vào các phần tử khác
    if (e.target.closest('.ant-card-actions') || 
        e.target.closest('.ant-dropdown-trigger') ||
        e.target.closest('.ant-btn') ||
        e.target.closest('.ant-popconfirm')) {
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

  const getStatusIcon = (status) => {
    const icons = {
      'not-started': <ClockCircleOutlined />,
      'in-progress': <ClockCircleOutlined />,
      'on-hold': <ClockCircleOutlined />,
      'completed': <CheckCircleOutlined />,
      'cancelled': <DeleteOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'blue',
      'medium': 'orange',
      'high': 'red'
    };
    return colors[priority] || 'default';
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      'low': 'Thấp',
      'medium': 'Trung bình',
      'high': 'Cao'
    };
    return priorityMap[priority] || priority;
  };

  const calculateProgress = (project) => {
    if (!project.totalTasks || project.totalTasks === 0) return 0;
    return Math.round((project.completedTasks / project.totalTasks) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    return moment(dateString).format('DD/MM/YYYY');
  };

  const handleStatusChange = async (newStatus) => {
    if (onChangeStatus) {
      setLoading(true);
      try {
        await onChangeStatus(project.id, newStatus);
        message.success('Cập nhật trạng thái thành công!');
      } catch (error) {
        message.error('Cập nhật trạng thái thất bại!');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (onChangePriority) {
      setLoading(true);
      try {
        await onChangePriority(project.id, newPriority);
        message.success('Cập nhật độ ưu tiên thành công!');
      } catch (error) {
        message.error('Cập nhật độ ưu tiên thất bại!');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(project.id);
    }
  };

  // Menu dropdown cho các hành động
  const getDropdownMenu = () => {
    const items = [];

    // Thêm mục thay đổi trạng thái nếu có quyền
    if (onChangeStatus && hasPermission('edit_projects')) {
      items.push({
        key: 'status',
        icon: <ClockCircleOutlined />,
        label: 'Thay đổi trạng thái',
        children: [
          {
            key: 'status-not-started',
            label: 'Chưa bắt đầu',
            disabled: project.status === 'not-started',
            onClick: () => handleStatusChange('not-started')
          },
          {
            key: 'status-in-progress',
            label: 'Đang thực hiện',
            disabled: project.status === 'in-progress',
            onClick: () => handleStatusChange('in-progress')
          },
          {
            key: 'status-on-hold',
            label: 'Tạm dừng',
            disabled: project.status === 'on-hold',
            onClick: () => handleStatusChange('on-hold')
          },
          {
            key: 'status-completed',
            label: 'Hoàn thành',
            disabled: project.status === 'completed',
            onClick: () => handleStatusChange('completed')
          },
          {
            key: 'status-cancelled',
            label: 'Đã hủy',
            disabled: project.status === 'cancelled',
            onClick: () => handleStatusChange('cancelled')
          }
        ]
      });
    }

    // Thêm mục thay đổi độ ưu tiên nếu có quyền
    if (onChangePriority && hasPermission('edit_projects')) {
      items.push({
        key: 'priority',
        icon: <FlagOutlined />,
        label: 'Thay đổi độ ưu tiên',
        children: [
          {
            key: 'priority-low',
            label: 'Thấp',
            disabled: project.priority === 'low',
            onClick: () => handlePriorityChange('low')
          },
          {
            key: 'priority-medium',
            label: 'Trung bình',
            disabled: project.priority === 'medium',
            onClick: () => handlePriorityChange('medium')
          },
          {
            key: 'priority-high',
            label: 'Cao',
            disabled: project.priority === 'high',
            onClick: () => handlePriorityChange('high')
          }
        ]
      });
    }

    // Thêm mục xóa nếu có quyền
    if (onDelete && hasPermission('delete_project')) {
      items.push({
        key: 'delete',
        icon: <DeleteOutlined />,
        label: (
          <Popconfirm
            title="Xóa dự án"
            description="Bạn có chắc chắn muốn xóa dự án này?"
            onConfirm={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <span style={{ color: '#ff4d4f' }}>Xóa dự án</span>
          </Popconfirm>
        ),
        danger: true
      });
    }

    return items;
  };

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

  // Thêm edit action nếu có quyền
  if (onEdit && hasPermission('edit_projects')) {
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

  // Thêm dropdown menu nếu có ít nhất một hành động
  const dropdownMenu = getDropdownMenu();
  if (dropdownMenu.length > 0) {
    actions.push(
      <Dropdown 
        menu={{ items: dropdownMenu }} 
        trigger={['click']}
        placement="bottomRight"
        disabled={loading}
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
        }`,
        position: 'relative',
        overflow: 'hidden'
      }}
      hoverable
      onClick={handleCardClick}
      actions={actions}
      loading={loading}
    >
      {/* Badge thumbnail */}
      {project.thumbnail && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 60,
            height: 60,
            backgroundImage: `url(${project.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderBottomLeftRadius: 8,
            opacity: 0.9
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, marginRight: project.thumbnail ? 60 : 0 }}>
          <h3 style={{ 
            margin: 0, 
            marginBottom: 8,
            fontSize: '16px',
            fontWeight: 600,
            color: '#1890ff'
          }}>
            {project.name || project.title}
          </h3>
          <p style={{ 
            color: '#666', 
            fontSize: '13px',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5'
          }}>
            {project.description || project.content}
          </p>
        </div>
        
        <Space direction="vertical" align="end" size={4}>
          <Tag 
            icon={getStatusIcon(project.status)} 
            color={getStatusColor(project.status)}
            style={{ margin: 0 }}
          >
            {getStatusText(project.status)}
          </Tag>
          <Tag 
            color={getPriorityColor(project.priority)}
            style={{ margin: 0 }}
          >
            {getPriorityText(project.priority)}
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

      {/* Thông tin ngày tháng */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Space size="small">
          <CalendarOutlined style={{ color: '#666', fontSize: '12px' }} />
          <Tooltip title="Ngày bắt đầu">
            <span style={{ fontSize: '12px', color: '#666' }}>
              {formatDate(project.startDate || project.timeStart)}
            </span>
          </Tooltip>
        </Space>
        
        <Space size="small">
          <CalendarOutlined style={{ color: '#666', fontSize: '12px' }} />
          <Tooltip title="Hạn hoàn thành">
            <span style={{ fontSize: '12px', color: '#666' }}>
              {formatDate(project.dueDate || project.timeFinish)}
            </span>
          </Tooltip>
        </Space>
      </div>

      {/* Team Members */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {project.teamMembers && project.teamMembers.length > 0 ? (
          <>
            <Avatar.Group 
              size="small" 
              maxCount={3} 
              maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
            >
              {project.teamMembers.map((member, index) => (
                <Tooltip 
                  key={index} 
                  title={typeof member === 'object' ? member.fullName || member.name : member} 
                  placement="top"
                >
                  <Avatar 
                    src={typeof member === 'object' ? member.avatar : null} 
                    icon={<UserOutlined />} 
                  />
                </Tooltip>
              ))}
            </Avatar.Group>
            
            <span style={{ fontSize: '11px', color: '#999' }}>
              {project.teamMembers.length} thành viên
            </span>
          </>
        ) : (
          <Space size="small">
            <TeamOutlined style={{ color: '#999', fontSize: '12px' }} />
            <span style={{ fontSize: '11px', color: '#999' }}>
              Chưa có thành viên
            </span>
          </Space>
        )}
      </div>

      {/* Footer với thông tin người tạo */}
      <div style={{ 
        marginTop: 12, 
        paddingTop: 12, 
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Space size="small">
          <UserOutlined style={{ color: '#999', fontSize: '11px' }} />
          <span style={{ fontSize: '11px', color: '#999' }}>
            Tạo bởi: {project.createdBy?.fullName || project.createdBy || 'N/A'}
          </span>
        </Space>
        
        {project.updatedAt && (
          <Tooltip title={`Cập nhật: ${moment(project.updatedAt).format('DD/MM/YYYY HH:mm')}`}>
            <span style={{ fontSize: '10px', color: '#ccc' }}>
              {moment(project.updatedAt).fromNow()}
            </span>
          </Tooltip>
        )}
      </div>
    </Card>
  );
};

export default ProjectCard;