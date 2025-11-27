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
  Divider,
  Spin,
  Pagination
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import TaskForm from '../../components/Tasks/TaskForm';
import TaskCard from '../../components/Tasks/TaskCard';
import TaskBoard from '../../components/Tasks/TaskBoard';
import taskService from '../../services/taskService';
import userService from '../../services/userService';

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
  //add
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  // // Mock users data
  // const users = [
  //   { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', avatar: null },
  //   { id: 2, name: 'Trần Thị B', email: 'b@example.com', avatar: null },
  //   { id: 3, name: 'Lê Văn C', email: 'c@example.com', avatar: null },
  // ];

  // Load tasks từ API
  const loadTasks = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.pageSize,
        search: search || searchText,
        status: filterStatus !== 'all' ? filterStatus : undefined
      };

      const response = await taskService.getTasks(params);
      
      // Xử lý response theo cấu trúc từ backend
      if (response.data && Array.isArray(response.data)) {
        setTasks(response.data);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.total || response.data.length
        }));
      } else if (Array.isArray(response)) {
        // Nếu response là array trực tiếp
        setTasks(response);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.length
        }));
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      message.error(error.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load users từ API
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await userService.getUsers();
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (Array.isArray(response)) {
        setUsers(response);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load mock data
  useEffect(() => {
    loadTasks(1);//add 1
    //add
    loadUsers();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, filterStatus]);//filterPriority

  // const loadTasks = () => {
  //   setLoading(true);
  //   // Mock data
  //   const mockTasks = [
  //     {
  //       id: 1,
  //       title: 'Thiết kế giao diện trang chủ',
  //       description: 'Thiết kế wireframe và mockup cho trang chủ website',
  //       priority: 'high',
  //       status: 'in-progress',
  //       assignee: users[0],
  //       dueDate: '2024-12-15',
  //       tags: ['design', 'ui/ux'],
  //       createdAt: '2024-01-10'
  //     },
  //     {
  //       id: 2,
  //       title: 'Phát triển API authentication',
  //       description: 'Xây dựng hệ thống xác thực JWT cho ứng dụng',
  //       priority: 'high',
  //       status: 'todo',
  //       assignee: users[1],
  //       dueDate: '2024-12-20',
  //       tags: ['backend', 'api'],
  //       createdAt: '2024-01-10'
  //     },
  //     {
  //       id: 3,
  //       title: 'Viết tài liệu hệ thống',
  //       description: 'Hoàn thiện tài liệu hướng dẫn sử dụng',
  //       priority: 'medium',
  //       status: 'done',
  //       assignee: users[2],
  //       dueDate: '2024-12-10',
  //       tags: ['documentation'],
  //       createdAt: '2024-01-08'
  //     },
  //     {
  //       id: 4,
  //       title: 'Review code cho module user',
  //       description: 'Kiểm tra và đánh giá code cho module quản lý người dùng',
  //       priority: 'low',
  //       status: 'backlog',
  //       dueDate: '2024-12-25',
  //       tags: ['review', 'quality'],
  //       createdAt: '2024-01-09'
  //     }
  //   ];
  //   setTasks(mockTasks);
  //   setLoading(false);
  // };

  //ADD
  // Tìm kiếm real-time
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      loadTasks(1, searchText);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchText]);

  // Filter khi status thay đổi
  useEffect(() => {
    loadTasks(1);
  }, [filterStatus]);

  
  const filterTasks = () => {
    let filtered = tasks;

    //(old)
    // // Filter by search text
    // if (searchText) {
    //   filtered = filtered.filter(task =>
    //     task.title.toLowerCase().includes(searchText.toLowerCase()) ||
    //     task.description.toLowerCase().includes(searchText.toLowerCase()) ||
    //     (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())))
    //   );
    // }

    // // Filter by status
    // if (filterStatus !== 'all') {
    //   filtered = filtered.filter(task => task.status === filterStatus);
    // }

    // // Filter by priority
    // if (filterPriority !== 'all') {
    //   filtered = filtered.filter(task => task.priority === filterPriority);
    // }

    // ADD
    // Filter client-side cho trường hợp backend không hỗ trợ filter
    if (searchText && !pagination.total) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        task.content?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterStatus !== 'all' && !pagination.total) {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    setFilteredTasks(filtered);
  };

  // Tạo task mới
  const handleCreateTask = async (values) => {
    setFormLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi lên backend
      const taskData = {
        title: values.title,
        content: values.content,
        status: values.status,
        timeStart: values.timeStart,
        timeFinish: values.timeFinish,
        priority: values.priority,
        tags: values.tags
      };

      // Thêm assigneeId nếu có
      if (values.assigneeId) {
        taskData.assigneeId = values.assigneeId;
      }

      await taskService.createTask(taskData);
      message.success('Tạo công việc thành công!');
      setModalVisible(false);
      loadTasks(1); // Reload trang đầu tiên
    } catch (error) {
      message.error(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Cập nhật task
  const handleUpdateTask = async (values) => {
    setFormLoading(true);
    try {
      const taskData = {
        title: values.title,
        content: values.content,
        status: values.status,
        timeStart: values.timeStart,
        timeFinish: values.timeFinish,
        priority: values.priority,
        tags: values.tags
      };

      // Thêm assigneeId nếu có
      if (values.assigneeId) {
        taskData.assigneeId = values.assigneeId;
      }

      await taskService.updateTask(editingTask.id, taskData);
      message.success('Cập nhật công việc thành công!');
      setModalVisible(false);
      setEditingTask(null);
      loadTasks(pagination.current);
    } catch (error) {
      message.error(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Xoá task
  const handleDeleteTask = (taskId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa công việc này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await taskService.deleteTask(taskId);
          message.success('Xóa công việc thành công!');
          loadTasks(pagination.current);
        } catch (error) {
          message.error(error.message);
        }
      }
    });
  };

  // Thay đổi trạng thái task
  const handleTaskMove = async (taskId, newStatus) => {
    try {
      await taskService.changeTaskStatus(taskId, newStatus);
      message.success('Cập nhật trạng thái công việc thành công!');
      loadTasks(pagination.current);
    } catch (error) {
      message.error(error.message);
      // Rollback UI nếu cần
      loadTasks(pagination.current);
    }
  };

  // Xem chi tiết task
  const handleViewTaskDetail = async (taskId) => {
    try {
      const taskDetail = await taskService.getTaskDetail(taskId);
      setEditingTask(taskDetail.data || taskDetail);
      setModalVisible(true);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleFormFinish = (values) => {
    if (editingTask) {
      handleUpdateTask(values);
    } else {
      handleCreateTask(values);
    }
  };

  const handleModalCancel = () => {
    if (editingTask && !formLoading) {
      Modal.confirm({
        title: 'Xác nhận thoát',
        content: 'Bạn chưa lưu dữ liệu, xác nhận thoát?',
        okText: 'Thoát',
        cancelText: 'Ở lại',
        onOk: () => {
          setModalVisible(false);
          setEditingTask(null);
        }
      });
    } else {
      setModalVisible(false);
      setEditingTask(null);
    }
  };

  // Xử lý phân trang
  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
    loadTasks(page);
  };

  // Refresh data
  const handleRefresh = () => {
    loadTasks(pagination.current);
    loadUsers();
  };

  // Map task từ backend sang frontend format
  const mapTaskFromBackend = (task) => {
    return {
      ...task,
      id: task.id || task._id, // Hỗ trợ cả id và _id
      description: task.content,
      dueDate: task.timeFinish,
      // Đảm bảo các trường required có giá trị mặc định
      title: task.title || 'Không có tiêu đề',
      status: task.status || 'todo',
      content: task.content || '',
      timeStart: task.timeStart || null,
      timeFinish: task.timeFinish || null,
      assignee: task.assignee || null
    };
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Công Việc Cá Nhân
            </Title>
            <p style={{ margin: 0, color: '#666' }}>
              Tổng số: {pagination.total || tasks.length} công việc
            </p>
          </div>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTask(null);
                setModalVisible(true);
              }}
              loading={loading}
            >
              Tạo Công Việc
            </Button>
          </Space>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm kiếm theo tên công việc..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              onSearch={(value) => loadTasks(1, value)}
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              placeholder="Lọc theo trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="todo">Chưa bắt đầu</Option>
              <Option value="in-progress">Đang thực hiện</Option>
              <Option value="done">Hoàn thành</Option>
              <Option value="backlog">Tồn đọng</Option>
            </Select>
          </Col>
          <Col xs={12} md={6} style={{ textAlign: 'right' }}>
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
      <Spin spinning={loading}>
        {viewMode === 'board' ? (
          <TaskBoard
            tasks={filteredTasks.map(mapTaskFromBackend)}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onTaskMove={handleTaskMove}
            onViewDetail={handleViewTaskDetail}
          />
        ) : (
          <>
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
                      task={mapTaskFromBackend(task)}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onViewDetail={handleViewTaskDetail}
                      showStatusTag={true}
                    />
                  </Col>
                ))
              )}
            </Row>
            
            {/* Pagination */}
            {pagination.total > pagination.pageSize && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} của ${total} công việc`
                  }
                />
              </div>
            )}
          </>
        )}
      </Spin>

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
          loading={formLoading}
          users={users}
          showAssignee={false} // Đặt false cho công việc cá nhân
        />
      </Modal>
    </div>
  );
};

export default PersonalTasks;