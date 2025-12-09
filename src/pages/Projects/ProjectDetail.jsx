// pages/Projects/ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  List,
  Avatar,
  Space,
  Tabs,
  Timeline,
  Descriptions,
  Breadcrumb,
  Typography,
  Modal,
  message,
  Input,
  Form,
  Tooltip,
  Divider,
  Select,
  DatePicker,
  App
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CommentOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import projectService from '../../services/projectService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const ProjectDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subProjects, setSubProjects] = useState([]); // Đổi từ tasks thành subProjects
  const [subProjectModalVisible, setSubProjectModalVisible] = useState(false);
  const [editingSubProject, setEditingSubProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadProjectDetail();
    loadUsers();
  }, [id]);

  const loadUsers = async () => {
    try {
      // Fetch users từ API
      // const response = await userService.getUsers();
      // setUsers(response.data);
      
      // Mock data
      const mockUsers = [
        { _id: '1', fullName: 'Nguyễn Văn A', email: 'a@example.com', avatar: null },
        { _id: '2', fullName: 'Trần Thị B', email: 'b@example.com', avatar: null },
        { _id: '3', fullName: 'Lê Văn C', email: 'c@example.com', avatar: null },
        { _id: '4', fullName: 'Phạm Thị D', email: 'd@example.com', avatar: null }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadProjectDetail = async () => {
    setLoading(true);
    try {
      const response = await projectService.getProjectDetail(id);
      const projectData = response.data;
      
      setProject(projectData);
      setComments(projectData.comments || []);
      
      // Load sub-projects (dự án con)
      if (projectData.children) {
        setSubProjects(projectData.children);
      } else {
        // Nếu backend không trả về children, fetch riêng
        const subProjectsResponse = await projectService.getProjects({
          parentId: id,
          limit: 50
        });
        setSubProjects(subProjectsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading project detail:', error);
      message.error('Không thể tải chi tiết dự án');
    } finally {
      setLoading(false);
    }
  };

  // Tạo dự án con (công việc)
  const handleCreateSubProject = async (values) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Thêm các field
      formData.append('title', values.title);
      formData.append('content', values.content || '');
      formData.append('status', values.status || 'not-started');
      formData.append('priority', values.priority || 'medium');
      
      if (values.timeStart) {
        formData.append('timeStart', values.timeStart.format('YYYY-MM-DD'));
      }
      if (values.timeFinish) {
        formData.append('timeFinish', values.timeFinish.format('YYYY-MM-DD'));
      }
      
      // Quan trọng: Thêm projectParentId
      formData.append('projectParentId', id);
      
      // Thêm thành viên nếu có
      if (values.listUser && values.listUser.length > 0) {
        formData.append('listUser', JSON.stringify(values.listUser));
      }
      
      // Thêm người tạo
      if (user && user.id) {
        formData.append('createdBy', user.id);
      }
      
      const response = await projectService.createProject(formData);
      
      if (response.success) {
        message.success('Tạo công việc thành công!');
        setSubProjectModalVisible(false);
        loadProjectDetail(); // Reload để lấy dữ liệu mới
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

  const handleUpdateSubProject = async (values) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Thêm các field
      formData.append('title', values.title);
      formData.append('content', values.content || '');
      formData.append('status', values.status || 'not-started');
      formData.append('priority', values.priority || 'medium');
      
      if (values.timeStart) {
        formData.append('timeStart', values.timeStart.format('YYYY-MM-DD'));
      }
      if (values.timeFinish) {
        formData.append('timeFinish', values.timeFinish.format('YYYY-MM-DD'));
      }
      
      // Thêm thành viên nếu có
      if (values.listUser && values.listUser.length > 0) {
        formData.append('listUser', JSON.stringify(values.listUser));
      }
      
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

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      message.warning('Vui lòng nhập nội dung comment');
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

  if (loading && !project) {
    return <div>Loading...</div>;
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

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/projects')}>Dự án</a>
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
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          <Space>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setSubProjectModalVisible(true)}
            >
              Thêm công việc
            </Button>
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
              title="Chưa bắt đầu"
              value={subProjectStats.notStarted}
              valueStyle={{ color: '#faad14' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Project Details */}
        <Col xs={24} lg={8}>
          <Card title="Thông tin dự án" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Người tạo">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{project.createdBy?.fullName || project.createdBy}</span>
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
          {project.listUser && project.listUser.length > 0 && (
            <Card title="Thành viên nhóm" style={{ marginBottom: 16 }}>
              <List
                dataSource={project.listUser}
                renderItem={member => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={typeof member === 'object' ? member.fullName : member}
                      description={typeof member === 'object' ? member.email : ''}
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
                    <Button 
                      type="primary" 
                      style={{ marginTop: 16 }}
                      onClick={() => setSubProjectModalVisible(true)}
                    >
                      Thêm công việc đầu tiên
                    </Button>
                  </div>
                ) : (
                  <List
                    dataSource={subProjects}
                    renderItem={(subProject) => (
                      <List.Item
                        actions={[
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/projects/detail/${subProject._id}`)}
                          >
                            Xem
                          </Button>,
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditSubProject(subProject)}
                          >
                            Sửa
                          </Button>,
                          <Button
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDeleteSubProject(subProject._id)}
                          >
                            Xóa
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              style={{ 
                                backgroundColor: getStatusColor(subProject.status),
                                color: '#fff'
                              }}
                            >
                              {subProject.title?.charAt(0) || 'T'}
                            </Avatar>
                          }
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{subProject.title}</span>
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
                                {subProject.timeFinish && `Hạn: ${moment(subProject.timeFinish).format('DD/MM')}`}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </TabPane>

              <TabPane tab="Thảo luận" key="discussions">
                {/* Comment Input */}
                <Card style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Avatar 
                      size="large" 
                      src={user?.avatar} 
                      icon={<UserOutlined />}
                    />
                    <div style={{ flex: 1 }}>
                      <TextArea
                        rows={3}
                        placeholder="Thêm bình luận..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <div style={{ marginTop: 8, textAlign: 'right' }}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
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

                {/* Comments List */}
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <CommentOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <div>Chưa có bình luận nào</div>
                  </div>
                ) : (
                  <List
                    dataSource={comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
                    renderItem={(comment) => (
                      <List.Item key={comment._id}>
                        <List.Item.Meta
                          avatar={
                            <Avatar>
                              {comment.userName?.charAt(0) || <UserOutlined />}
                            </Avatar>
                          }
                          title={
                            <Space>
                              <strong>{comment.userName}</strong>
                              <Tooltip title={moment(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                                <span style={{ color: '#999', fontSize: 12 }}>{moment(comment.createdAt).fromNow()}</span>
                              </Tooltip>
                            </Space>
                          }
                          description={<p>{comment.comment}</p>}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Sub Project Form Modal */}
      <Modal
        title={editingSubProject ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
        open={subProjectModalVisible}
        onCancel={() => {
          setSubProjectModalVisible(false);
          setEditingSubProject(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={editingSubProject ? handleUpdateSubProject : handleCreateSubProject}
          initialValues={editingSubProject ? {
            title: editingSubProject.title,
            content: editingSubProject.content,
            status: editingSubProject.status,
            priority: editingSubProject.priority,
            timeStart: editingSubProject.timeStart ? moment(editingSubProject.timeStart) : null,
            timeFinish: editingSubProject.timeFinish ? moment(editingSubProject.timeFinish) : null,
            listUser: editingSubProject.listUser?.map(u => u._id || u) || []
          } : {}}
        >
          <Form.Item
            name="title"
            label="Tên công việc"
            rules={[{ required: true, message: 'Vui lòng nhập tên công việc!' }]}
          >
            <Input placeholder="Nhập tên công việc" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Mô tả công việc"
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết công việc..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                initialValue="not-started"
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="not-started">Chưa bắt đầu</Option>
                  <Option value="in-progress">Đang thực hiện</Option>
                  <Option value="on-hold">Tạm dừng</Option>
                  <Option value="completed">Hoàn thành</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                initialValue="medium"
              >
                <Select placeholder="Chọn độ ưu tiên">
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="timeStart"
                label="Ngày bắt đầu"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày bắt đầu"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="timeFinish"
                label="Hạn hoàn thành"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn hạn hoàn thành"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="listUser"
            label="Thành viên phụ trách"
          >
            <Select
              mode="multiple"
              placeholder="Chọn thành viên"
              allowClear
              showSearch
            >
              {users.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setSubProjectModalVisible(false);
                  setEditingSubProject(null);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingSubProject ? 'Cập nhật' : 'Tạo công việc'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
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