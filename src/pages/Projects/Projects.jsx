import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  Tag,
  App
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ProjectOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../../components/Projects/ProjectCard';
import ProjectForm from '../../components/Projects/ProjectForm';
import { useAuth } from '../../contexts/AuthContext';
import projectService from '../../services/projectService';
import debounce from 'lodash/debounce';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ProjectsContent = () => {
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const {hasPermission, user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [isManager, setIsManager] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      const managerRoles = ['manager', 'MANAGER'];
      setIsManager(managerRoles.includes(currentUser.role));
      loadUsers();
      loadProjects();
    }
  }, [currentUser, pagination.current, pagination.pageSize, sortField, sortOrder]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchText, filterStatus, filterPriority, activeTab]);

  const loadUsers = async () => {
    try {
      // Fetch users từ API users nếu có
      // const response = await userService.getUsers();
      // setUsers(response.data);
      
      // Mock data tạm thời
      const mockUsers = [
        { _id: '1', fullName: 'Nguyễn Văn A', email: 'a@example.com', avatar: null },
        { _id: '2', fullName: 'Trần Thị B', email: 'b@example.com', avatar: null },
        { _id: currentUser?.id, fullName: currentUser?.fullName, email: currentUser?.email, avatar: currentUser?.avatar }
      ].filter(Boolean);
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: sortField,
        sortOrder: sortOrder,
        search: searchText,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
      };

      const response = await projectService.getProjects(params);
      
      setProjects(response.data || []);
      setFilteredProjects(response.data || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || response.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading projects:', error);
      message.error(error.message || 'Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchText(value);
      setPagination({ ...pagination, current: 1 });
    }, 500),
    [pagination]
  );

  const filterProjects = () => {
    let filtered = projects;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        project.content?.toLowerCase().includes(searchText.toLowerCase())
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

  const handleFormFinish = async (formData) => {
    try {
      setLoading(true);
      // Nếu đang tạo dự án mới, set người tạo là người phụ trách
      if (!editingProject) {
        formData.assignee_id = currentUser.id;
        formData.createdBy = currentUser.id;
      }
      
      // Gọi API tạo/cập nhật dự án
      let response;
      if (editingProject) {
        response = await projectService.updateProject(editingProject._id, formData);
      } else {
        response = await projectService.createProject(formData);
      }
      
      if (response.success) {
        message.success(response.message || 'Thao tác thành công!');
        setModalVisible(false);
        setEditingProject(null);
        loadProjects();
      } else {
        message.error(response.message || 'Thao tác thất bại!');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error(error.message || 'Thao tác thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa dự án này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      async onOk() {
        try {
          const response = await projectService.deleteProject(projectId);
          
          if (response.success) {
            message.success(response.message || 'Xóa dự án thành công!');
            loadProjects();
          } else {
            message.error(response.message || 'Xóa dự án thất bại!');
          }
        } catch (error) {
          console.error('Error deleting project:', error);
          message.error(error.message || 'Xóa dự án thất bại!');
        }
      }
    });
  };

  const handleChangeMultiple = async (key, value) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một dự án');
      return;
    }

    try {
      const response = await projectService.changeMultipleProjects(selectedRowKeys, key, value);
      
      if (response.success) {
        message.success('Cập nhật hàng loạt thành công!');
        setSelectedRowKeys([]);
        loadProjects();
      } else {
        message.error(response.message || 'Cập nhật hàng loạt thất bại!');
      }
    } catch (error) {
      console.error('Error changing multiple:', error);
      message.error(error.message || 'Cập nhật hàng loạt thất bại!');
    }
  };

  const navigate = useNavigate();

  const handleViewProject = (project) => {
    navigate(`/projects/detail/${project._id}`);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingProject(null);
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // Kiểm tra quyền sửa/xóa dự án
  const canEditProject = (project) => {
    if (!currentUser || !project) return false;
    
    // 1. Người tạo dự án có quyền (và cũng là người phụ trách)
    if (project.createdBy === currentUser.id) return true;
    
    // 3. Manager có quyền sửa tất cả
    if (isManager) return true;
    
    return false;
  };

  const canDeleteProject = (project) => {
    if (!currentUser || !project) return false;
    
    // Chỉ người tạo dự án hoặc Manager mới được xóa
    return project.createdBy === currentUser.id || isManager;
  };

  const columns = [
    {
      title: 'Tên dự án',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'not-started': { text: 'Chưa bắt đầu', color: 'default' },
          'in-progress': { text: 'Đang thực hiện', color: 'processing' },
          'on-hold': { text: 'Tạm dừng', color: 'warning' },
          'completed': { text: 'Hoàn thành', color: 'success' },
          'cancelled': { text: 'Đã hủy', color: 'error' },
        };
        const statusInfo = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const priorityMap = {
          'low': { text: 'Thấp', color: 'blue' },
          'medium': { text: 'Trung bình', color: 'orange' },
          'high': { text: 'Cao', color: 'red' },
        };
        const priorityInfo = priorityMap[priority] || { text: priority, color: 'default' };
        return <Tag color={priorityInfo.color}>{priorityInfo.text}</Tag>;
      },
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'timeStart',
      key: 'timeStart',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Hạn hoàn thành',
      dataIndex: 'timeFinish',
      key: 'timeFinish',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Vai trò',
      key: 'role',
      render: (_, record) => {
        let roleText = '';
        let roleColor = 'default';
        
        if (record.createdBy === currentUser?.id) {
          roleText = 'Phụ trách';
          roleColor = 'gold';
        } else if (record.listUser?.includes(currentUser?.id)) {
          roleText = 'Thành viên';
          roleColor = 'green';
        }
        
        return roleText ? <Tag color={roleColor}>{roleText}</Tag> : '-';
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewProject(record)}
          />
          {canEditProject(record) && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditProject(record)}
            />
          )}
          {canDeleteProject(record) && (
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteProject(record._id)}
            />
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    total: pagination.total,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    notStarted: projects.filter(p => p.status === 'not-started').length,
    // Manager phụ trách các dự án mình tạo
    assignedToMe: projects.filter(p => p.createdBy === currentUser?.id).length,
  };

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ProjectOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              {isManager ? 'Quản Lý Dự Án' : 'Dự Án Của Tôi'}
            </Title>
            <p style={{ margin: 0, color: '#666' }}>
              {isManager 
                ? 'Quản lý và theo dõi tiến độ tất cả dự án' 
                : 'Các dự án bạn đang tham gia và phụ trách'}
            </p>
          </div>

          {/* Chỉ Manager mới có quyền tạo dự án mới */}
          {isManager && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Tạo Dự Án
            </Button>
          )}
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
              title={isManager ? "Bạn phụ trách" : "Bạn phụ trách"}
              value={stats.assignedToMe}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
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
              label: `Tất cả (${stats.total})`
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
            <Input
              placeholder="Tìm kiếm dự án..."
              prefix={<SearchOutlined />}
              onChange={(e) => debouncedSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
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
              allowClear
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

        {/* Bulk Actions - Chỉ Manager mới có quyền */}
        {isManager && selectedRowKeys.length > 0 && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Space>
                <span>Đã chọn {selectedRowKeys.length} dự án:</span>
                <Select
                  placeholder="Cập nhật trạng thái"
                  style={{ width: 150 }}
                  onChange={(value) => handleChangeMultiple('status', value)}
                >
                  <Option value="not-started">Chưa bắt đầu</Option>
                  <Option value="in-progress">Đang thực hiện</Option>
                  <Option value="on-hold">Tạm dừng</Option>
                  <Option value="completed">Hoàn thành</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
                <Select
                  placeholder="Cập nhật độ ưu tiên"
                  style={{ width: 150 }}
                  onChange={(value) => handleChangeMultiple('priority', value)}
                >
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                </Select>
                <Button
                  danger
                  onClick={() => handleChangeMultiple('delete', true)}
                >
                  Xóa đã chọn
                </Button>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {/* Projects Display */}
      {viewMode === 'grid' ? (
        filteredProjects.length === 0 ? (
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
                key={project._id} 
                xs={24} 
                sm={12} 
                lg={8}
                xl={6}
              >
                <ProjectCard
                  project={{
                    id: project._id,
                    name: project.title,
                    description: project.content,
                    status: project.status,
                    priority: project.priority,
                    thumbnail: project.thumbnail,
                    startDate: project.timeStart,
                    dueDate: project.timeFinish,
                    assignee_id: project.createdBy, // assignee_id = createdBy
                    createdBy: project.createdBy,
                    listUser: project.listUser || [],
                  }}
                  currentUser={currentUser}
                  onView={handleViewProject}
                  onEdit={canEditProject(project) ? handleEditProject : undefined}
                  onDelete={canDeleteProject(project) ? handleDeleteProject : undefined}
                />
              </Col>
            ))}
          </Row>
        )
      ) : (
        <Card>
          <Table
            rowSelection={isManager ? rowSelection : undefined} // Chỉ Manager mới được chọn nhiều
            columns={columns}
            dataSource={filteredProjects}
            rowKey="_id"
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </Card>
      )}

      {/* Project Form Modal - Chỉ Manager mới tạo dự án mới */}
      {isManager && (
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
            currentUser={currentUser}
            isParentProject={true} // Đây là dự án cha do Manager tạo
            autoAssignToCreator={!editingProject}
          />
        </Modal>
      )}
    </div>
  );
};

const Projects = () => {
  return (
    <App>
      <ProjectsContent />
    </App>
  );
};

export default Projects;