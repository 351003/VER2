import React, { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Modal,
  message,
  Input,
  Select,
  Row,
  Col,
  Tabs,
  Card,
  Empty,
  Typography,
  Statistic,
  Tag
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../../components/Projects/ProjectCard';
import ProjectForm from '../../components/Projects/ProjectForm';
import { useAuth } from '../../contexts/AuthContext';
import PermissionWrapper from '../../components/Common/PermissionWrapper';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const { hasPermission } = useAuth();

  // Mock data
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', avatar: null },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com', avatar: null },
    { id: 3, name: 'Lê Văn C', email: 'c@example.com', avatar: null },
    { id: 4, name: 'Phạm Thị D', email: 'd@example.com', avatar: null }
  ];

  const teams = [
    { id: 1, name: 'Frontend Team' },
    { id: 2, name: 'Backend Team' },
    { id: 3, name: 'Design Team' },
    { id: 4, name: 'Marketing Team' }
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchText, filterStatus, filterPriority, activeTab]);

  const loadProjects = () => {
    setLoading(true);
    // Mock projects data
    const mockProjects = [
      {
        id: 1,
        name: 'Website Redesign',
        description: 'Thiết kế lại giao diện website công ty với UX/UI hiện đại',
        status: 'in-progress',
        priority: 'high',
        startDate: '2024-01-01',
        dueDate: '2024-03-31',
        teamId: 1,
        projectManager: 1,
        teamMembers: [users[0], users[1], users[2]],
        totalTasks: 24,
        completedTasks: 18,
        tags: ['website', 'design', 'ux/ui'],
        createdAt: '2024-01-01'
      },
      {
        id: 2,
        name: 'Mobile App Development',
        description: 'Phát triển ứng dụng di động cho iOS và Android',
        status: 'in-progress',
        priority: 'high',
        startDate: '2024-01-15',
        dueDate: '2024-06-30',
        teamId: 2,
        projectManager: 2,
        teamMembers: [users[1], users[3]],
        totalTasks: 45,
        completedTasks: 12,
        tags: ['mobile', 'react-native', 'ios', 'android'],
        createdAt: '2024-01-10'
      },
      {
        id: 3,
        name: 'CRM System',
        description: 'Xây dựng hệ thống quản lý quan hệ khách hàng',
        status: 'not-started',
        priority: 'medium',
        startDate: '2024-02-01',
        dueDate: '2024-08-31',
        teamId: 2,
        projectManager: 3,
        teamMembers: [users[0], users[2], users[3]],
        totalTasks: 36,
        completedTasks: 0,
        tags: ['crm', 'backend', 'database'],
        createdAt: '2024-01-20'
      },
      {
        id: 4,
        name: 'Marketing Campaign Q1',
        description: 'Chiến dịch marketing cho quý 1 năm 2024',
        status: 'completed',
        priority: 'medium',
        startDate: '2024-01-01',
        dueDate: '2024-03-31',
        teamId: 4,
        projectManager: 4,
        teamMembers: [users[3]],
        totalTasks: 15,
        completedTasks: 15,
        tags: ['marketing', 'campaign', 'q1'],
        createdAt: '2024-01-01'
      },
      {
        id: 5,
        name: 'API Documentation',
        description: 'Viết tài liệu API cho các hệ thống hiện có',
        status: 'on-hold',
        priority: 'low',
        startDate: '2024-01-10',
        dueDate: '2024-02-28',
        teamId: 2,
        projectManager: 1,
        teamMembers: [users[1]],
        totalTasks: 8,
        completedTasks: 3,
        tags: ['documentation', 'api'],
        createdAt: '2024-01-05'
      }
    ];
    setProjects(mockProjects);
    setLoading(false);
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchText.toLowerCase()) ||
        project.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())))
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(project => project.priority === filterPriority);
    }

    // Filter by active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(project => project.status === activeTab);
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = (values) => {
    if (!hasPermission('create_project')) {
      message.error('Bạn không có quyền tạo dự án!');
      return;
    }
    const newProject = {
      id: Date.now(),
      ...values,
      totalTasks: 0,
      completedTasks: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProjects(prev => [newProject, ...prev]);
    message.success('Tạo dự án thành công!');
    setModalVisible(false);
  };

  const handleUpdateProject = (values) => {
    if (!hasPermission('edit_projects')) {
      message.error('Bạn không có quyền chỉnh sửa dự án!');
      return;
    }

    setProjects(prev => prev.map(project =>
      project.id === editingProject.id
        ? { ...project, ...values }
        : project
    ));
    message.success('Cập nhật dự án thành công!');
    setModalVisible(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId) => {
    if (!hasPermission('delete_project')) {
      message.error('Bạn không có quyền xóa dự án!');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa dự án này? Tất cả công việc liên quan cũng sẽ bị xóa.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        setProjects(prev => prev.filter(project => project.id !== projectId));
        message.success('Xóa dự án thành công!');
      }
    });
  };

  const navigate = useNavigate();

  const handleViewProject = (project) => {
    message.info(`Xem chi tiết dự án: ${project.name}`);
    navigate(`/projects/${project.id}`);
  };
  

  const handleEditProject = (project) => {
    setEditingProject(project);
    setModalVisible(true);
  };

  const handleFormFinish = (values) => {
    if (editingProject) {
      handleUpdateProject(values);
    } else {
      handleCreateProject(values);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingProject(null);
  };

  // Statistics
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    notStarted: projects.filter(p => p.status === 'not-started').length
  };

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ProjectOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              Quản Lý Dự Án
            </Title>
            <p style={{ margin: 0, color: '#666' }}>
              Quản lý và theo dõi tiến độ tất cả dự án
            </p>
          </div>

          <PermissionWrapper permission="create_projects">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Tạo Dự Án
          </Button>
          </PermissionWrapper>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng số dự án"
              value={stats.total}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang thực hiện"
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chưa bắt đầu"
              value={stats.notStarted}
              valueStyle={{ color: '#faad14' }}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Tabs */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: `Tất cả (${projects.length})`
            },
            {
              key: 'in-progress',
              label: `Đang thực hiện (${stats.inProgress})`
            },
            {
              key: 'not-started',
              label: `Chưa bắt đầu (${stats.notStarted})`
            },
            {
              key: 'completed',
              label: `Hoàn thành (${stats.completed})`
            },
            {
              key: 'on-hold',
              label: `Tạm dừng (${projects.filter(p => p.status === 'on-hold').length})`
            }
          ]}
        />

        <Row gutter={[16, 16]} style={{ marginTop: 16 }} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm kiếm dự án..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="not-started">Chưa bắt đầu</Option>
              <Option value="in-progress">Đang thực hiện</Option>
              <Option value="on-hold">Tạm dừng</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <Select
              value={filterPriority}
              onChange={setFilterPriority}
              style={{ width: '100%' }}
              placeholder="Độ ưu tiên"
            >
              <Option value="all">Tất cả ưu tiên</Option>
              <Option value="high">Cao</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="low">Thấp</Option>
            </Select>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<AppstoreOutlined />}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                icon={<UnorderedListOutlined />}
                type={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <Card>
          <Empty
            description="Không tìm thấy dự án nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProjects.map(project => (
            <Col 
              key={project.id} 
              xs={24} 
              sm={viewMode === 'list' ? 24 : 12} 
              lg={viewMode === 'list' ? 24 : 8}
              xl={viewMode === 'list' ? 24 : 6}
            >
              <ProjectCard
                project={project}
                onView={handleViewProject}
                onEdit={hasPermission('edit_projects') ? handleEditProject : undefined}
                onDelete={hasPermission('delete_project') ? handleDeleteProject : undefined}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Project Form Modal */}
      <Modal
        title={editingProject ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <ProjectForm
          visible={modalVisible}
          onCancel={handleModalCancel}
          onFinish={handleFormFinish}
          initialValues={editingProject}
          loading={loading}
          users={users}
          teams={teams}
        />
      </Modal>
    </div>
  );
};

export default Projects;