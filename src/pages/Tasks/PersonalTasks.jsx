import React, { useState, useEffect } from "react";
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
  Pagination,
  App,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import TaskForm from "../../components/Tasks/TaskForm";
import TaskCard from "../../components/Tasks/TaskCard";
import TaskBoard from "../../components/Tasks/TaskBoard";
import taskService from "../../services/taskService";
import userService from "../../services/userService";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const PersonalTasks = () => {
  const { modal } = App.useApp();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [viewMode, setViewMode] = useState("board");
  //add
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  // // Mock users data
  // const users = [
  //   { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', avatar: null },
  //   { id: 2, name: 'Trần Thị B', email: 'b@example.com', avatar: null },
  //   { id: 3, name: 'Lê Văn C', email: 'c@example.com', avatar: null },
  // ];

  // Load tasks từ API
  const loadTasks = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const keywordToSend = (search || searchText || "").trim();
      const params = {
        page,
        limit: pagination.pageSize,
        keyword: keywordToSend, // Always send keyword (empty string if no search)
        status: filterStatus !== "all" ? filterStatus : undefined,
      };

      console.log("getTasks params:", params);
      const response = await taskService.getTasks(params);
      console.log("getTasks response:", response);
      
      // Backend trả về {code, message, data, pagination}
      if (response.code === 200) {
        setTasks(response.data || []);
        
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: response.pagination?.total || response.data?.length || 0,
        }));
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback nếu response là {data: [...]}
        setTasks(response.data);

        setPagination((prev) => ({
          ...prev,
          current: page,
          total: response.total || response.data.length,
        }));
      } else if (Array.isArray(response)) {
        // Fallback nếu response là array trực tiếp
        setTasks(response);
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: response.length,
        }));
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      message.error(error.message || "Không thể tải danh sách công việc");
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
      console.error("Error loading users:", error);
      message.error("Không thể tải danh sách người dùng");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load mock data
  useEffect(() => {
    loadTasks(1); //add 1
    //add
    loadUsers();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, filterStatus]); //filterPriority

  //ADD
  // Tìm kiếm real-time
  useEffect(() => {
    console.log("Search effect triggered, searchText:", searchText);
    const delaySearch = setTimeout(() => {
      console.log("Debounce timer fired, calling loadTasks with searchText:", searchText);
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

    // ADD
    // Filter client-side cho trường hợp backend không hỗ trợ filter
    if (searchText && !pagination.total) {
      filtered = filtered.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          task.content?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterStatus !== "all" && !pagination.total) {
      filtered = filtered.filter((task) => task.status === filterStatus);
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
        // tags: values.tags,
      };

      // Thêm assigneeId nếu có
      if (values.assigneeId) {
        taskData.assigneeId = values.assigneeId;
      }

      console.log("Creating task with data:", taskData);
      console.log("Token:", localStorage.getItem('token'));
      
      await taskService.createTask(taskData);
      message.success("Tạo công việc thành công!");
      setModalVisible(false);
      loadTasks(1); // Reload trang đầu tiên
    } catch (error) {
      console.error("Create task error:", error);
      message.error(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Cập nhật task
  const handleUpdateTask = async (values) => {
    setFormLoading(true);
    try {
      console.log("Updating task:", editingTask);
      console.log("Task ID:", editingTask?._id);
      
      const taskData = {
        title: values.title,
        content: values.content,
        status: values.status,
        timeStart: values.timeStart,
        timeFinish: values.timeFinish,
        priority: values.priority,
        tags: values.tags,
      };

      // Thêm assigneeId nếu có
      if (values.assigneeId) {
        taskData.assigneeId = values.assigneeId;
      }

      const taskId = editingTask?._id;
      if (!taskId) {
        message.error("Task ID không hợp lệ!");
        return;
      }

      await taskService.updateTask(taskId, taskData);
      message.success("Cập nhật công việc thành công!");
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
    console.log("handleDeleteTask called with taskId:", taskId);
    console.log("Opening modal.confirm...");
    
    try {
      modal.confirm({
        title: "Xác nhận xóa",
        content: "Bạn có chắc chắn muốn xóa công việc này?",
        okText: "Xóa",
        cancelText: "Hủy",
        okType: "danger",
        onOk: async () => {
          console.log("Modal onOk called, deleting task with ID:", taskId);
          try {
            const response = await taskService.deleteTask(taskId);
            console.log("Delete response:", response);
            message.success("Xóa công việc thành công!");
            loadTasks(pagination.current);
          } catch (error) {
            console.error("Delete error:", error);
            message.error(error.message || "Lỗi xóa công việc");
          }
        },
        onCancel() {
          console.log("Modal cancelled");
        },
      });
      console.log("modal.confirm called successfully");
    } catch (error) {
      console.error("Error in handleDeleteTask:", error);
    }
  };

  // Thay đổi trạng thái task
  const handleTaskMove = async (taskId, newStatus) => {
    console.log("handleTaskMove called:", { taskId, newStatus });
    try {
      await taskService.changeTaskStatus(taskId, newStatus);
      message.success("Cập nhật trạng thái công việc thành công!");
      loadTasks(pagination.current);
    } catch (error) {
      console.error("handleTaskMove error:", error);
      message.error(error.message || "Lỗi cập nhật trạng thái");
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
    setModalVisible(false);
    setEditingTask(null);
    setFormLoading(false);
  };

  // Xử lý phân trang
  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
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
      title: task.title || "Không có tiêu đề",
      status: task.status || "todo",
      content: task.content || "",
      timeStart: task.timeStart || null,
      timeFinish: task.timeFinish || null,
      assignee: task.assignee || null,
    };
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Công Việc Cá Nhân
            </Title>
            <p style={{ margin: 0, color: "#666" }}>
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
              onChange={(e) => {
                console.log("Search onChange:", e.target.value);
                setSearchText(e.target.value);
              }}
              allowClear
              onSearch={(value) => {
                console.log("Search onSearch triggered with value:", value);
                setSearchText(value);
                loadTasks(1, value);
              }}
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: "100%" }}
              placeholder="Lọc theo trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="todo">Chưa bắt đầu</Option>
              <Option value="in-progress">Đang thực hiện</Option>
              <Option value="done">Hoàn thành</Option>
              <Option value="backlog">Tồn đọng</Option>
            </Select>
          </Col>
          <Col xs={12} md={6} style={{ textAlign: "right" }}>
            <Space>
              <Button
                icon={<AppstoreOutlined />}
                type={viewMode === "board" ? "primary" : "default"}
                onClick={() => setViewMode("board")}
              >
                Board
              </Button>
              <Button
                icon={<UnorderedListOutlined />}
                type={viewMode === "list" ? "primary" : "default"}
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tasks Display */}
      <Spin spinning={loading}>
        {viewMode === "board" ? (
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
                filteredTasks.map((task) => (
                  <Col key={task._id} xs={24} lg={12} xl={8}>
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
              <div style={{ marginTop: 16, textAlign: "center" }}>
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
        title={editingTask ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
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

// Wrap component trong App context
const PersonalTasksWithApp = () => {
  return (
    <App>
      <PersonalTasks />
    </App>
  );
};

export default PersonalTasksWithApp;
