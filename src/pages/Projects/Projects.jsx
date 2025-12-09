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
  Checkbox,
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
  TeamOutlined,
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
import PermissionWrapper from '../../components/Common/PermissionWrapper';
import projectService from '../../services/projectService'; // Import service mới
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
  const { hasPermission, user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    loadUsers();
    loadAllProjects();
    loadProjects();
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);

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
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAllProjects = async () => {
    try {
      const response = await projectService.getProjects({ pageSize: 1000 });
      setAllProjects(response.data || []);
    } catch (error) {
      console.error('Error loading all projects:', error);
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
      const { data, pagination: paginationData } = response;
      
      setProjects(data || []);
      setFilteredProjects(data || []);
      setPagination({
        ...pagination,
        total: paginationData?.total || data?.length || 0,
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

  const handleCreateProject = async (formData) => {
    try {
      setLoading(true);
      const response = await projectService.createProject(formData);
      
      if (response.success) {
        message.success(response.message || 'Tạo dự án thành công!');
        setModalVisible(false);
        loadProjects();
        loadAllProjects();
      } else {
        message.error(response.message || 'Tạo dự án thất bại!');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      message.error(error.message || 'Tạo dự án thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      setLoading(true);
      const response = await projectService.updateProject(editingProject._id, formData);
      
      if (response.success) {
        message.success(response.message || 'Cập nhật dự án thành công!');
        setModalVisible(false);
        setEditingProject(null);
        loadProjects();
        loadAllProjects();
      } else {
        message.error(response.message || 'Cập nhật dự án thất bại!');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      message.error(error.message || 'Cập nhật dự án thất bại!');
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
            loadAllProjects();
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

  const handleChangeStatus = async (projectId, newStatus) => {
    try {
      const response = await projectService.changeProjectStatus(projectId, newStatus);
      
      if (response.success) {
        message.success('Cập nhật trạng thái thành công!');
        loadProjects();
      } else {
        message.error(response.message || 'Cập nhật trạng thái thất bại!');
      }
    } catch (error) {
      console.error('Error changing status:', error);
      message.error(error.message || 'Cập nhật trạng thái thất bại!');
    }
  };

  const handleChangePriority = async (projectId, newPriority) => {
    try {
      const response = await projectService.changeProjectPriority(projectId, newPriority);
      
      if (response.success) {
        message.success('Cập nhật độ ưu tiên thành công!');
        loadProjects();
      } else {
        message.error(response.message || 'Cập nhật độ ưu tiên thất bại!');
      }
    } catch (error) {
      console.error('Error changing priority:', error);
      message.error(error.message || 'Cập nhật độ ưu tiên thất bại!');
    }
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

  // Trong Projects.jsx
const handleFormFinish = async (formData) => {
  try {
    setLoading(true);
    
    // Kiểm tra nếu đang tạo dự án cha mới
    const isCreatingParent = formData.get('isCreatingParent') === 'true';
    const parentProjectData = formData.get('parentProjectData');
    
    if (isCreatingParent && parentProjectData) {
      try {
        // Tạo dự án cha trước
        const parentData = JSON.parse(parentProjectData);
        const parentFormData = new FormData();
        
        // Thêm thông tin dự án cha
        parentFormData.append('title', parentData.title);
        parentFormData.append('content', parentData.description || '');
        parentFormData.append('status', parentData.status);
        parentFormData.append('priority', parentData.priority);
        parentFormData.append('isParentProject', 'true'); // Đánh dấu là dự án cha
        parentFormData.append('createdBy', currentUser.id);
        
        // Tạo dự án cha
        const parentResponse = await projectService.createProject(parentFormData);
        
        if (parentResponse.success) {
          // Thêm ID của dự án cha vào formData của dự án con
          formData.append('projectParentId', parentResponse.data._id);
          message.success('Đã tạo dự án cha thành công!');
        } else {
          throw new Error(parentResponse.message || 'Tạo dự án cha thất bại');
        }
      } catch (error) {
        console.error('Error creating parent project:', error);
        message.error('Tạo dự án cha thất bại: ' + error.message);
        return;
      }
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
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewProject(record)}
          />
          {hasPermission('edit_projects') && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditProject(record)}
            />
          )}
          {hasPermission('delete_project') && (
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

        {/* Bulk Actions */}
        {selectedRowKeys.length > 0 && (
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
                    teamMembers: project.listUser || [],
                    totalTasks: project.totalTasks || 0,
                    completedTasks: project.completedTasks || 0,
                  }}
                  onView={handleViewProject}
                  onEdit={hasPermission('edit_projects') ? handleEditProject : undefined}
                  onDelete={hasPermission('delete_project') ? handleDeleteProject : undefined}
                  onChangeStatus={handleChangeStatus}
                  onChangePriority={handleChangePriority}
                />
              </Col>
            ))}
          </Row>
        )
      ) : (
        <Card>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredProjects}
            rowKey="_id"
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </Card>
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
          projects={allProjects.filter(p => !editingProject || p._id !== editingProject._id)}
          currentUser={currentUser}
        />
      </Modal>
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