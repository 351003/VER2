// pages/Projects/ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  List,
  Avatar,
  Space,
  Tabs,
  Descriptions,
  Breadcrumb,
  Typography,
  Modal,
  message,
  Input,
  Form,
  Tooltip,
  Select,
  DatePicker,
  App, 
  Popconfirm
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CommentOutlined,
  PlusOutlined,
  EyeOutlined,
  LockOutlined,
  SendOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import projectService from '../../services/projectService';
import ProjectForm from '../../components/Projects/ProjectForm';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const ProjectDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subProjects, setSubProjects] = useState([]);
  const [subProjectModalVisible, setSubProjectModalVisible] = useState(false);
  const [editingSubProject, setEditingSubProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]); // Thành viên trong dự án này

  useEffect(() => {
    if (id) {
      loadProjectDetail();
    }
  }, [id]);

  useEffect(() => {
    if (project) {
      loadProjectUsers();
    }
  }, [project]);

  // Load danh sách user từ project
  const loadProjectUsers = async () => {
    try {
      // Mock data - trong thực tế sẽ lấy từ API
      const mockUsers = [
        { _id: '1', fullName: 'Nguyễn Văn A', email: 'a@example.com', avatar: null },
        { _id: '2', fullName: 'Trần Thị B', email: 'b@example.com', avatar: null },
        { _id: '3', fullName: 'Lê Văn C', email: 'c@example.com', avatar: null },
        { _id: '4', fullName: 'Phạm Thị D', email: 'd@example.com', avatar: null },
        { _id: user?.id, fullName: user?.fullName, email: user?.email, avatar: user?.avatar }
      ].filter(Boolean);

      // Lọc chỉ lấy users có trong dự án
      const projectMemberIds = [];
      
      // Thêm người tạo (cũng là người phụ trách)
      if (project.createdBy) {
        projectMemberIds.push(project.createdBy);
      }
      
      // Thêm thành viên từ listUser
      if (project.listUser && Array.isArray(project.listUser)) {
        project.listUser.forEach(member => {
          const memberId = typeof member === 'object' ? member._id : member;
          if (memberId && !projectMemberIds.includes(memberId)) {
            projectMemberIds.push(memberId);
          }
        });
      }
      
      // Lọc users
      const filteredUsers = mockUsers.filter(userItem => 
        projectMemberIds.includes(userItem._id)
      );
      
      setProjectUsers(filteredUsers);
      setUsers(filteredUsers); // Cũng set cho users để dùng trong form
    } catch (error) {
      console.error('Error loading project users:', error);
    }
  };

  const loadProjectDetail = async () => {
    setLoading(true);
    try {
      const response = await projectService.getProjectDetail(id);
      
      if (!response.success) {
        message.error('Không thể tải chi tiết dự án');
        navigate('/projects');
        return;
      }
      
      const projectData = response.data;
      setProject(projectData);
      setComments(response.comments || []);
      
      // Load sub-projects (công việc)
      const subProjectsResponse = await projectService.getProjects({
        parentId: id,
        limit: 100
      });
      
      setSubProjects(subProjectsResponse.data || []);
    } catch (error) {
      console.error('Error loading project detail:', error);
      message.error('Không thể tải chi tiết dự án');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra user có thể tạo công việc không
  const canCreateSubProject = () => {
    if (!project || !user) return false;
    
    // 1. Người tạo dự án cha có quyền (cũng là người phụ trách)
    if (project.createdBy === user.id) return true;
    
    // 2. Thành viên trong dự án có quyền
    const isMember = project.listUser?.some(member => {
      const memberId = typeof member === 'object' ? member._id : member;
      return memberId === user.id;
    });
    
    return isMember || false;
  };

  // Kiểm tra user có thể sửa/xóa công việc không
  const canEditSubProject = (subProject) => {
    if (!user || !subProject) return false;
    
    // 1. Người tạo công việc có quyền
    if (subProject.createdBy === user.id) return true;
    
    // 2. Người tạo dự án cha có quyền
    if (project.createdBy === user.id) return true;
    
    // 3. Manager có quyền sửa tất cả
    if (user.role === 'MANAGER') return true;
    
    return false;
  };

  // Tạo công việc (sub-project)
  const handleCreateSubProject = async (formData) => {
    try {
      setLoading(true);
      
      // Thêm projectParentId vào formData
      formData.append('projectParentId', id);
      
      const response = await projectService.createProject(formData);
      
      if (response.success) {
        message.success('Tạo công việc thành công!');
        setSubProjectModalVisible(false);
        loadProjectDetail();
      } else {
        message.error(response.message || 'Tạo công việc thất bại!');
      }
    } catch (error) {
      console.error('Error creating sub-project:', error);
      message.error(error.message || 'Tạo công việc thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubProject = async (subProjectId) => {
    Modal.confirm({
      title: 'Xóa công việc',
      content: 'Bạn có chắc chắn muốn xóa công việc này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      async onOk() {
        try {
          const response = await projectService.deleteProject(subProjectId);
          
          if (response.success) {
            message.success('Xóa công việc thành công!');
            loadProjectDetail();
          } else {
            message.error(response.message || 'Xóa công việc thất bại!');
          }
        } catch (error) {
          console.error('Error deleting sub-project:', error);
          message.error(error.message || 'Xóa công việc thất bại!');
        }
      }
    });
  };

  const handleEditSubProject = (subProject) => {
    setEditingSubProject(subProject);
    setSubProjectModalVisible(true);
  };

  const handleUpdateSubProject = async (formData) => {
    try {
      setLoading(true);
      
      const response = await projectService.updateProject(editingSubProject._id, formData);
      
      if (response.success) {
        message.success('Cập nhật công việc thành công!');
        setSubProjectModalVisible(false);
        setEditingSubProject(null);
        loadProjectDetail();
      } else {
        message.error(response.message || 'Cập nhật công việc thất bại!');
      }
    } catch (error) {
      console.error('Error updating sub-project:', error);
      message.error(error.message || 'Cập nhật công việc thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // Xác định xem user có thể comment không
  const canComment = () => {
    if (!project || !user) return false;
    
    // 1. Người tạo dự án cha có thể comment
    if (project.createdBy === user.id) return true;
    
    // 2. Thành viên trong dự án có thể comment
    const isMember = project.listUser?.some(member => {
      const memberId = typeof member === 'object' ? member._id : member;
      return memberId === user.id;
    });
    
    return isMember || false;
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      message.warning('Vui lòng nhập nội dung comment');
      return;
    }

    if (!canComment()) {
      message.warning('Bạn không có quyền comment trong dự án này');
      return;
    }

    setSubmitting(true);
    try {
      const response = await projectService.addComment(id, commentText);
      
      if (response.success) {
        setCommentText('');
        loadProjectDetail();
        message.success('Thêm comment thành công!');
      } else {
        message.error(response.message || 'Thêm comment thất bại!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error(error.message || 'Thêm comment thất bại!');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Mở modal chỉnh sửa comment
  const handleEditComment = (comment) => {
    // Kiểm tra xem user có phải là người tạo comment không
    if (comment.user_id !== user?.id) {
      message.warning('Bạn không được chỉnh sửa comment của người khác');
      return;
    }
    
    setEditingComment(comment);
    setEditCommentText(comment.comment);
    setCommentModalVisible(true);
  };

  // Lưu comment sau khi chỉnh sửa
  const handleSaveCommentEdit = async () => {
    if (!editCommentText.trim()) {
      message.warning('Vui lòng nhập nội dung comment');
      return;
    }

    try {
      const response = await projectService.editComment(editingComment._id, editCommentText);
      
      if (response.success) {
        message.success(response.message || 'Đã chỉnh sửa comment!');
        setCommentModalVisible(false);
        setEditingComment(null);
        setEditCommentText('');
        loadProjectDetail(); // Load lại để cập nhật comment
      } else {
        message.error(response.message || 'Chỉnh sửa comment thất bại!');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      message.error(error.message || 'Chỉnh sửa comment thất bại!');
    }
  };

  // Xóa comment
  const handleDeleteComment = async (comment) => {
    // Kiểm tra xem user có phải là người tạo comment không
    if (comment.user_id !== user?.id) {
      message.warning('Bạn không được xóa comment của người khác');
      return;
    }

    try {
      const response = await projectService.deleteComment(comment._id);
      
      if (response.success) {
        message.success(response.message || 'Đã xóa comment!');
        loadProjectDetail(); // Load lại để cập nhật danh sách comment
      } else {
        message.error(response.message || 'Xóa comment thất bại!');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      message.error(error.message || 'Xóa comment thất bại!');
    }
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

  // Lấy thông tin user từ ID
  const getUserInfo = (userId) => {
    return projectUsers.find(u => u._id === userId) || 
           users.find(u => u._id === userId);
  };

  if (loading && !project) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Đang tải dự án...</Title>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Title level={3}>Dự án không tồn tại</Title>
        <Button onClick={() => navigate('/projects')}>
          Quay lại danh sách dự án
        </Button>
      </div>
    );
  }

  const subProjectStats = {
    total: subProjects.length,
    completed: subProjects.filter(p => p.status === 'completed').length,
    inProgress: subProjects.filter(p => p.status === 'in-progress').length,
    notStarted: subProjects.filter(p => p.status === 'not-started').length,
  };

  // Tỷ lệ hoàn thành
  const completionRate = subProjectStats.total > 0 
    ? Math.round((subProjectStats.completed / subProjectStats.total) * 100) 
    : 0;

  // Người tạo dự án = Người phụ trách
  const projectCreator = getUserInfo(project.createdBy);
  const isCreator = project.createdBy === user?.id;

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/projects')} style={{ cursor: 'pointer' }}>
            Dự án
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{project.title}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Project Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Title level={2} style={{ margin: 0, marginRight: 16 }}>
                {project.title}
              </Title>
              <Space>
                <Tag color={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Tag>
                <Tag color={getPriorityColor(project.priority)}>
                  {project.priority === 'high' ? 'Ưu tiên cao' : 
                   project.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}
                </Tag>
                {isCreator && (
                  <Tag color="gold" icon={<CrownOutlined />}>
                    Bạn phụ trách
                  </Tag>
                )}
              </Space>
            </div>
            
            <Text style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
              {project.content}
            </Text>

            {/* Project Thumbnail */}
            {project.thumbnail && (
              <div style={{ marginTop: 12 }}>
                <img 
                  src={project.thumbnail} 
                  alt="Thumbnail" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 200, 
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}
          </div>

          <Space>
            {/* Chỉ hiển thị nút Thêm công việc nếu user có quyền */}
            {canCreateSubProject() ? (
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setSubProjectModalVisible(true)}
              >
                Thêm công việc
              </Button>
            ) : (
              <Tooltip title="Bạn không có quyền tạo công việc trong dự án này">
                <Button 
                  type="primary"
                  icon={<LockOutlined />}
                  disabled
                >
                  Thêm công việc
                </Button>
              </Tooltip>
            )}
          </Space>
        </div>
      </Card>

      {/* Project Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng công việc"
              value={subProjectStats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={subProjectStats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={subProjectStats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={completionRate}
              suffix="%"
              valueStyle={{ color: completionRate === 100 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Project Details */}
        <Col xs={24} lg={8}>
          <Card title="Thông tin dự án" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Người tạo & phụ trách">
                <Space>
                  <Avatar 
                    size="small" 
                    src={projectCreator?.avatar} 
                    icon={<CrownOutlined />}
                    style={{ 
                      backgroundColor: isCreator ? '#fadb14' : '#1890ff',
                      color: '#fff'
                    }}
                  />
                  <span>
                    {projectCreator?.fullName || project.createdBy}
                    {isCreator && (
                      <Tag color="gold" size="small" style={{ marginLeft: 8 }}>Bạn</Tag>
                    )}
                  </span>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày bắt đầu">
                <Space>
                  <CalendarOutlined />
                  <span>{project.timeStart ? moment(project.timeStart).format('DD/MM/YYYY') : 'Chưa có'}</span>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Hạn hoàn thành">
                <Space>
                  <CalendarOutlined />
                  <span>{project.timeFinish ? moment(project.timeFinish).format('DD/MM/YYYY') : 'Chưa có'}</span>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày tạo">
                {moment(project.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Team Members */}
          {projectUsers.length > 0 && (
            <Card title="Thành viên nhóm" style={{ marginBottom: 16 }}>
              <List
                dataSource={projectUsers}
                renderItem={userItem => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          src={userItem.avatar} 
                          icon={userItem._id === project.createdBy ? <CrownOutlined /> : <UserOutlined />}
                          style={{ 
                            backgroundColor: userItem._id === project.createdBy ? '#fadb14' : '#d9d9d9'
                          }}
                        >
                          {userItem.fullName?.charAt(0)}
                        </Avatar>
                      }
                      title={
                        <Space>
                          <span>{userItem.fullName}</span>
                          {userItem._id === project.createdBy && (
                            <Tag color="gold" size="small">Phụ trách</Tag>
                          )}
                          {userItem._id === user?.id && (
                            <Tag color="green" size="small">Bạn</Tag>
                          )}
                        </Space>
                      }
                      description={userItem.email}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>

        {/* Main Content - Sub Projects */}
        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="subProjects">
              <TabPane tab={`Công việc (${subProjects.length})`} key="subProjects">
                {subProjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <div>Chưa có công việc nào</div>
                    {canCreateSubProject() && (
                      <Button 
                        type="primary" 
                        style={{ marginTop: 16 }}
                        onClick={() => setSubProjectModalVisible(true)}
                      >
                        Thêm công việc đầu tiên
                      </Button>
                    )}
                  </div>
                ) : (
                  <List
                    dataSource={subProjects}
                    renderItem={(subProject) => {
                      const subProjectCreator = getUserInfo(subProject.createdBy);
                      const isSubProjectCreator = subProject.createdBy === user?.id;
                      
                      return (
                        <List.Item
                          actions={[
                            <Button
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => navigate(`/projects/detail/${subProject._id}`)}
                            >
                              Xem
                            </Button>,
                            
                            // Chỉ hiển thị nút sửa/xóa nếu có quyền
                            canEditSubProject(subProject) && (
                              <>
                                <Button
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditSubProject(subProject)}
                                >
                                  Sửa
                                </Button>
                                <Button
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  danger
                                  onClick={() => handleDeleteSubProject(subProject._id)}
                                >
                                  Xóa
                                </Button>
                              </>
                            )
                          ].filter(Boolean)}
                        >
                          <List.Item.Meta
                            avatar={
                              <Tooltip title={subProjectCreator ? `Người tạo: ${subProjectCreator.fullName}` : 'Người tạo'}>
                                <Avatar 
                                  style={{ 
                                    backgroundColor: isSubProjectCreator ? '#52c41a' : getStatusColor(subProject.status),
                                    color: '#fff'
                                  }}
                                  src={subProjectCreator?.avatar}
                                >
                                  {subProjectCreator?.fullName?.charAt(0) || subProject.title?.charAt(0) || 'T'}
                                </Avatar>
                              </Tooltip>
                            }
                            title={
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span>{subProject.title}</span>
                                
                                {/* Hiển thị người tạo/phụ trách */}
                                {subProjectCreator && (
                                  <Tag color={isSubProjectCreator ? "green" : "blue"} size="small" style={{ margin: 0 }}>
                                    <Space size={4}>
                                      <UserOutlined />
                                      <span>{subProjectCreator.fullName}</span>
                                      {isSubProjectCreator && (
                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>(Bạn)</span>
                                      )}
                                    </Space>
                                  </Tag>
                                )}
                                
                                {/* Status và Priority tags */}
                                <Tag color={getStatusColor(subProject.status)} size="small">
                                  {getStatusText(subProject.status)}
                                </Tag>
                                <Tag color={getPriorityColor(subProject.priority)} size="small">
                                  {subProject.priority === 'high' ? 'Cao' : 
                                   subProject.priority === 'medium' ? 'TB' : 'Thấp'}
                                </Tag>
                              </div>
                            }
                            description={
                              <div>
                                <div style={{ marginBottom: 4 }}>
                                  {subProject.content}
                                </div>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                  {subProject.timeStart && `Bắt đầu: ${moment(subProject.timeStart).format('DD/MM')} • `}
                                  {subProject.timeFinish && `Hạn: ${moment(subProject.timeFinish).format('DD/MM')} • `}
                                  {subProject.listUser?.length > 0 && `Thành viên: ${subProject.listUser.length}`}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                )}
              </TabPane>

              <TabPane tab="Thảo luận" key="discussions">
                {/* Kiểm tra quyền comment trước khi hiển thị input */}
                {canComment() ? (
                  <Card style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Avatar 
                        size="large" 
                        src={user?.avatar} 
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                      <div style={{ flex: 1 }}>
                        <TextArea
                          rows={3}
                          placeholder="Thêm bình luận..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          maxLength={500}
                          showCount
                        />
                        <div style={{ marginTop: 8, textAlign: 'right' }}>
                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleAddComment}
                            loading={submitting}
                            disabled={!commentText.trim()}
                          >
                            Gửi
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card style={{ marginBottom: 16, backgroundColor: '#fff2e8' }}>
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <LockOutlined style={{ fontSize: 24, color: '#fa8c16', marginBottom: 8 }} />
                      <div>Bạn không có quyền comment trong dự án này</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Chỉ người tạo và thành viên của dự án mới được comment
                      </Text>
                    </div>
                  </Card>
                )}
                
                {/* Comments List */}
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <CommentOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <div>Chưa có bình luận nào</div>
                    {!canComment() && (
                      <Text type="secondary" style={{ fontSize: '12px', marginTop: 8 }}>
                        Tham gia dự án để bình luận
                      </Text>
                    )}
                  </div>
                ) : (
                  <List
                    dataSource={comments.sort((a, b) => (b.position || 0) - (a.position || 0))}
                    renderItem={(comment) => {
                      const commentUser = getUserInfo(comment.user_id);
                      const isCommentOwner = comment.user_id === user?.id;
                      
                      return (
                        <List.Item 
                          key={comment._id}
                          actions={[
                            // Chỉ hiển thị nút chỉnh sửa nếu user là người tạo comment
                            isCommentOwner && (
                              <Button
                                size="small"
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEditComment(comment)}
                              >
                                Sửa
                              </Button>
                            ),
                            
                            // Chỉ hiển thị nút xóa nếu user là người tạo comment
                            isCommentOwner && (
                              <Popconfirm
                                title="Xóa comment"
                                description="Bạn có chắc chắn muốn xóa comment này?"
                                onConfirm={() => handleDeleteComment(comment)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okType="danger"
                              >
                                <Button
                                  size="small"
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                >
                                  Xóa
                                </Button>
                              </Popconfirm>
                            )
                          ].filter(Boolean)}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                size="large"
                                src={commentUser?.avatar}
                                style={{ 
                                  backgroundColor: isCommentOwner ? '#1890ff' : '#d9d9d9'
                                }}
                              >
                                {commentUser?.fullName?.charAt(0) || comment.userName?.charAt(0) || <UserOutlined />}
                              </Avatar>
                            }
                            title={
                              <Space>
                                <strong>{commentUser?.fullName || comment.userName}</strong>
                                {isCommentOwner && (
                                  <Tag color="blue" size="small">Bạn</Tag>
                                )}
                                {comment.user_id === project.createdBy && (
                                  <Tag color="gold" size="small" icon={<CrownOutlined />}>
                                    Phụ trách
                                  </Tag>
                                )}
                                <Tooltip title={moment(comment.createdAt || comment.created_at).format('YYYY-MM-DD HH:mm:ss')}>
                                  <span style={{ color: '#999', fontSize: 12 }}>
                                    {moment(comment.createdAt || comment.created_at).fromNow()}
                                  </span>
                                </Tooltip>
                              </Space>
                            }
                            description={
                              <div>
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{comment.comment}</p>
                                {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                  <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                                    <EditOutlined /> Đã chỉnh sửa {moment(comment.updatedAt).fromNow()}
                                  </Text>
                                )}
                              </div>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
      
      {/* Modal chỉnh sửa comment */}
      <Modal
        title="Chỉnh sửa comment"
        open={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false);
          setEditingComment(null);
          setEditCommentText('');
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setCommentModalVisible(false);
              setEditingComment(null);
              setEditCommentText('');
            }}
          >
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSaveCommentEdit}
            loading={submitting}
            disabled={!editCommentText.trim()}
          >
            Lưu thay đổi
          </Button>
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Nhập nội dung comment..."
          value={editCommentText}
          onChange={(e) => setEditCommentText(e.target.value)}
          maxLength={500}
          showCount
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Modal>

      {/* Sub Project Form Modal */}
      <Modal
        title={editingSubProject ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
        open={subProjectModalVisible}
        onCancel={() => {
          setSubProjectModalVisible(false);
          setEditingSubProject(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <ProjectForm
          visible={subProjectModalVisible}
          onCancel={() => {
            setSubProjectModalVisible(false);
            setEditingSubProject(null);
          }}
          onFinish={editingSubProject ? handleUpdateSubProject : handleCreateSubProject}
          initialValues={editingSubProject}
          loading={loading}
          users={projectUsers} // Chỉ cho chọn thành viên trong dự án
          currentUser={user}
          isParentProject={false} // Đây là sub-project (công việc)
        />
      </Modal>
    </div>
  );
};

const ProjectDetail = () => {
  return (
    <App>
      <ProjectDetailContent />
    </App>
  );
};

export default ProjectDetail;