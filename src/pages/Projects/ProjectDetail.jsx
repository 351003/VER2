import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageHeader,
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
  Divider,
  Breadcrumb,
  Typography,
  Modal,
  message
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
  CommentOutlined
} from '@ant-design/icons';
import TaskCard from '../../components/Tasks/TaskCard';
import TaskForm from '../../components/Tasks/TaskForm';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Mock data - trong thực tế sẽ fetch từ API
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', avatar: null, role: 'Project Manager' },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com', avatar: null, role: 'Frontend Developer' },
    { id: 3, name: 'Lê Văn C', email: 'c@example.com', avatar: null, role: 'Backend Developer' },
    { id: 4, name: 'Phạm Thị D', email: 'd@example.com', avatar: null, role: 'UI/UX Designer' }
  ];

  useEffect(() => {
    loadProjectData();
    loadProjectTasks();
  }, [id]);

  const loadProjectData = () => {
    // Mock project data
    const mockProject = {
      id: 1,
      name: 'Website Redesign',
      description: 'Thiết kế lại giao diện website công ty với UX/UI hiện đại, tối ưu trải nghiệm người dùng và cải thiện hiệu suất.',
      status: 'in-progress',
      priority: 'high',
      startDate: '2024-01-01',
      dueDate: '2024-03-31',
      teamId: 1,
      projectManager: users[0],
      teamMembers: [users[0], users[1], users[2], users[3]],
      totalTasks: 24,
      completedTasks: 18,
      tags: ['website', 'design', 'ux/ui', 'frontend', 'backend'],
      createdAt: '2024-01-01',
      budget: 50000000,
      client: 'Công ty ABC',
      progress: 75
    };
    setProject(mockProject);
  };

  const loadProjectTasks = () => {
    // Mock tasks for this project
    const mockTasks = [
      {
        id: 1,
        title: 'Thiết kế wireframe homepage',
        description: 'Tạo wireframe cho trang chủ với layout mới',
        priority: 'high',
        status: 'done',
        assignee: users[3],
        dueDate: '2024-01-15',
        tags: ['design', 'wireframe'],
        createdAt: '2024-01-01'
      },
      {
        id: 2,
        title: 'Phát triển component header',
        description: 'Xây dựng component header mới với responsive design',
        priority: 'high',
        status: 'in-progress',
        assignee: users[1],
        dueDate: '2024-02-20',
        tags: ['frontend', 'react', 'component'],
        createdAt: '2024-01-10'
      },
      {
        id: 3,
        title: 'API integration cho user dashboard',
        description: 'Kết nối API để hiển thị dữ liệu user trên dashboard',
        priority: 'medium',
        status: 'in-progress',
        assignee: users[2],
        dueDate: '2024-02-28',
        tags: ['backend', 'api', 'integration'],
        createdAt: '2024-01-12'
      },
      {
        id: 4,
        title: 'Testing và QA',
        description: 'Kiểm thử toàn bộ tính năng và fix bugs',
        priority: 'medium',
        status: 'todo',
        assignee: null,
        dueDate: '2024-03-20',
        tags: ['testing', 'qa'],
        createdAt: '2024-01-15'
      }
    ];
    setTasks(mockTasks);
    setLoading(false);
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

  const handleCreateTask = (values) => {
    const newTask = {
      id: Date.now(),
      ...values,
      assignee: users.find(user => user.id === values.assigneeId),
      createdAt: new Date().toISOString().split('T')[0],
      tags: values.tags || []
    };

    setTasks(prev => [newTask, ...prev]);
    message.success('Tạo công việc thành công!');
    setTaskModalVisible(false);
  };

  const handleDeleteTask = (taskId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa công việc này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        message.success('Xóa công việc thành công!');
      }
    });
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskModalVisible(true);
  };

  if (loading || !project) {
    return <div>Loading...</div>;
  }

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/projects')}>Dự án</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{project.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Project Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Title level={2} style={{ margin: 0, marginRight: 16 }}>
                {project.name}
              </Title>
              <Space>
                <Tag color={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Tag>
                <Tag color={getPriorityColor(project.priority)}>
                  {project.priority === 'high' ? 'Ưu tiên cao' : project.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}
                </Tag>
              </Space>
            </div>
            
            <Text style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
              {project.description}
            </Text>

            {/* Project Tags */}
            {project.tags && project.tags.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <Space wrap>
                  {project.tags.map(tag => (
                    <Tag key={tag} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>

          <Space>
            <Button icon={<EditOutlined />}>
              Chỉnh sửa
            </Button>
            <Button 
              type="primary"
              onClick={() => setTaskModalVisible(true)}
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
              value={taskStats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={taskStats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={taskStats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tiến độ"
              value={project.progress}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
              prefix={<FlagOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Project Details */}
        <Col xs={24} lg={8}>
          <Card title="Thông tin dự án" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Quản lý dự án">
                <Space>
                  <Avatar size="small" src={project.projectManager?.avatar} icon={<UserOutlined />} />
                  <span>{project.projectManager?.name}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                <Space>
                  <CalendarOutlined />
                  <span>{project.startDate}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Hạn hoàn thành">
                <Space>
                  <CalendarOutlined />
                  <span>{project.dueDate}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {project.client}
              </Descriptions.Item>
              <Descriptions.Item label="Ngân sách">
                {project.budget?.toLocaleString('vi-VN')} VNĐ
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Team Members */}
          <Card title="Thành viên nhóm" style={{ marginBottom: 16 }}>
            <List
              dataSource={project.teamMembers}
              renderItem={member => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={member.avatar} icon={<UserOutlined />} />}
                    title={member.name}
                    description={member.role}
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Progress */}
          <Card title="Tiến độ dự án">
            <div style={{ textAlign: 'center' }}>
              <Progress 
                type="circle" 
                percent={project.progress} 
                width={120}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: 16 }}>
                <Text strong>{project.completedTasks}/{project.totalTasks} công việc đã hoàn thành</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="tasks">
              <TabPane tab={`Công việc (${tasks.length})`} key="tasks">
                <Row gutter={[16, 16]}>
                  {tasks.length === 0 ? (
                    <Col span={24}>
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                        <div>Chưa có công việc nào</div>
                        <Button 
                          type="primary" 
                          style={{ marginTop: 16 }}
                          onClick={() => setTaskModalVisible(true)}
                        >
                          Thêm công việc đầu tiên
                        </Button>
                      </div>
                    </Col>
                  ) : (
                    tasks.map(task => (
                      <Col key={task.id} xs={24}>
                        <TaskCard
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          showStatusTag={true}
                        />
                      </Col>
                    ))
                  )}
                </Row>
              </TabPane>

              <TabPane tab="Hoạt động" key="activities">
                <Timeline>
                  <Timeline.Item color="green">
                    <p>Dự án được tạo</p>
                    <Text type="secondary">{project.createdAt} bởi {project.projectManager?.name}</Text>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <p>Bắt đầu thực hiện</p>
                    <Text type="secondary">{project.startDate}</Text>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <p>Đã hoàn thành 50% công việc</p>
                    <Text type="secondary">2024-02-15</Text>
                  </Timeline.Item>
                  <Timeline.Item>
                    <p>Dự kiến hoàn thành</p>
                    <Text type="secondary">{project.dueDate}</Text>
                  </Timeline.Item>
                </Timeline>
              </TabPane>

              <TabPane tab="Tài liệu" key="documents">
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                  <div>Chưa có tài liệu nào</div>
                </div>
              </TabPane>

              <TabPane tab="Thảo luận" key="discussions">
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <CommentOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                  <div>Chưa có thảo luận nào</div>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Task Form Modal */}
      <Modal
        title={editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}
        open={taskModalVisible}
        onCancel={() => {
          setTaskModalVisible(false);
          setEditingTask(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <TaskForm
          visible={taskModalVisible}
          onCancel={() => {
            setTaskModalVisible(false);
            setEditingTask(null);
          }}
          onFinish={(values) => {
            if (editingTask) {
              // Handle update
              setTasks(prev => prev.map(task =>
                task.id === editingTask.id
                  ? { 
                      ...task, 
                      ...values, 
                      assignee: users.find(user => user.id === values.assigneeId),
                      tags: values.tags || []
                    }
                  : task
              ));
              message.success('Cập nhật công việc thành công!');
            } else {
              handleCreateTask(values);
            }
            setTaskModalVisible(false);
            setEditingTask(null);
          }}
          initialValues={editingTask}
          loading={false}
          users={users}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetail;