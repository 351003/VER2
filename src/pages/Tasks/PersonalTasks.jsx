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
  Divider
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import TaskForm from '../../components/Tasks/TaskForm';
import TaskCard from '../../components/Tasks/TaskCard';
import TaskBoard from '../../components/Tasks/TaskBoard';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const PersonalTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('board');

  // Mock users data
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', avatar: null },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com', avatar: null },
    { id: 3, name: 'Lê Văn C', email: 'c@example.com', avatar: null },
  ];

  // Load mock data
  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, filterStatus, filterPriority]);

  const loadTasks = () => {
    setLoading(true);
    // Mock data
    const mockTasks = [
      {
        id: 1,
        title: 'Thiết kế giao diện trang chủ',
        description: 'Thiết kế wireframe và mockup cho trang chủ website',
        priority: 'high',
        status: 'in-progress',
        assignee: users[0],
        dueDate: '2024-12-15',
        tags: ['design', 'ui/ux'],
        createdAt: '2024-01-10'
      },
      {
        id: 2,
        title: 'Phát triển API authentication',
        description: 'Xây dựng hệ thống xác thực JWT cho ứng dụng',
        priority: 'high',
        status: 'todo',
        assignee: users[1],
        dueDate: '2024-12-20',
        tags: ['backend', 'api'],
        createdAt: '2024-01-10'
      },
      {
        id: 3,
        title: 'Viết tài liệu hệ thống',
        description: 'Hoàn thiện tài liệu hướng dẫn sử dụng',
        priority: 'medium',
        status: 'done',
        assignee: users[2],
        dueDate: '2024-12-10',
        tags: ['documentation'],
        createdAt: '2024-01-08'
      },
      {
        id: 4,
        title: 'Review code cho module user',
        description: 'Kiểm tra và đánh giá code cho module quản lý người dùng',
        priority: 'low',
        status: 'backlog',
        dueDate: '2024-12-25',
        tags: ['review', 'quality'],
        createdAt: '2024-01-09'
      }
    ];
    setTasks(mockTasks);
    setLoading(false);
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())))
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    setFilteredTasks(filtered);
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
    setModalVisible(false);
  };

  const handleUpdateTask = (values) => {
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
    setModalVisible(false);
    setEditingTask(null);
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
    setModalVisible(true);
  };

  // Trong phần handleTaskMove, thêm loading state
const handleTaskMove = (taskId, newStatus) => {
  setLoading(true);
  // Simulate API call
  setTimeout(() => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    message.success('Cập nhật trạng thái công việc thành công!');
    setLoading(false);
  }, 300);
};

  const handleFormFinish = (values) => {
    if (editingTask) {
      handleUpdateTask(values);
    } else {
      handleCreateTask(values);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTask(null);
  };

  return (
    <div>
      {/* Custom Header thay thế PageHeader */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Quản Lý Công Việc Cá Nhân
            </Title>
            <p style={{ margin: 0, color: '#666' }}>
              Tổng số: {tasks.length} công việc • Đang thực hiện: {tasks.filter(t => t.status === 'in-progress').length}
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Tạo Công Việc
          </Button>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm kiếm công việc..."
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
              <Option value="backlog">Tồn đọng</Option>
              <Option value="todo">Chưa bắt đầu</Option>
              <Option value="in-progress">Đang thực hiện</Option>
              <Option value="done">Hoàn thành</Option>
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
                type={viewMode === 'board' ? 'primary' : 'default'}
                onClick={() => setViewMode('board')}
              >
                Board
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

      {/* Tasks Display */}
      {viewMode === 'board' ? (
        <TaskBoard
          tasks={filteredTasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onTaskMove={handleTaskMove}
          
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTasks.length === 0 ? (
            <Col span={24}>
              <Empty
                description="Không tìm thấy công việc nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Col>
          ) : (
            filteredTasks.map(task => (
              <Col key={task.id} xs={24} lg={12} xl={8}>
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
      )}

      {/* Task Form Modal */}
      <Modal
        title={editingTask ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <TaskForm
          visible={modalVisible}
          onCancel={handleModalCancel}
          onFinish={handleFormFinish}
          initialValues={editingTask}
          loading={loading}
          showAssignee={false}
        />
      </Modal>
    </div>
  );
};

export default PersonalTasks;