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
  Tag,
  Avatar,
  Typography
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import TaskForm from '../../components/Tasks/TaskForm';
import TaskBoard from '../../components/Tasks/TaskBoard';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const TeamTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  
  // Mock data
  const teams = [
    { id: 1, name: 'Frontend Team', color: 'blue' },
    { id: 2, name: 'Backend Team', color: 'green' },
    { id: 3, name: 'Design Team', color: 'orange' }
  ];

  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', avatar: null, teamId: 1 },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com', avatar: null, teamId: 1 },
    { id: 3, name: 'Lê Văn C', email: 'c@example.com', avatar: null, teamId: 2 },
    { id: 4, name: 'Phạm Thị D', email: 'd@example.com', avatar: null, teamId: 3 }
  ];

  useEffect(() => {
    loadTeamTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, selectedTeam]);

  const loadTeamTasks = () => {
    setLoading(true);
    // Mock team tasks data
    const mockTasks = [
      {
        id: 1,
        title: 'Phát triển component UI mới',
        description: 'Xây dựng các component React mới cho design system',
        priority: 'high',
        status: 'in-progress',
        assignee: users[0],
        teamId: 1,
        dueDate: '2024-12-18',
        tags: ['frontend', 'react'],
        createdAt: '2024-01-10'
      },
      {
        id: 2,
        title: 'Tối ưu database performance',
        description: 'Phân tích và tối ưu các query database để cải thiện performance',
        priority: 'medium',
        status: 'todo',
        assignee: users[2],
        teamId: 2,
        dueDate: '2024-12-22',
        tags: ['backend', 'database'],
        createdAt: '2024-01-10'
      },
      {
        id: 3,
        title: 'Thiết kế mobile app interface',
        description: 'Thiết kế giao diện cho ứng dụng mobile',
        priority: 'high',
        status: 'backlog',
        assignee: users[3],
        teamId: 3,
        dueDate: '2024-12-25',
        tags: ['design', 'mobile'],
        createdAt: '2024-01-09'
      }
    ];
    setTasks(mockTasks);
    setLoading(false);
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (searchText) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedTeam !== 'all') {
      filtered = filtered.filter(task => task.teamId === parseInt(selectedTeam));
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = (values) => {
    const newTask = {
      id: Date.now(),
      ...values,
      assignee: users.find(user => user.id === values.assigneeId),
      teamId: values.teamId,
      createdAt: new Date().toISOString().split('T')[0],
      tags: values.tags || []
    };

    setTasks(prev => [newTask, ...prev]);
    message.success('Tạo công việc nhóm thành công!');
    setModalVisible(false);
  };

  const handleTaskMove = (taskId, newStatus) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    message.success('Cập nhật trạng thái công việc thành công!');
  };

  const handleFormFinish = (values) => {
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

  return (
    <div>
      {/* Custom Header thay thế PageHeader */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Công Việc Nhóm
              </Title>
              <p style={{ margin: 0, color: '#666' }}>
                Quản lý và theo dõi công việc theo nhóm
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Tạo Công Việc Nhóm
          </Button>
        </div>
      </Card>

      {/* Team Tabs */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={selectedTeam}
          onChange={setSelectedTeam}
          type="card"
        >
          <TabPane tab="Tất cả nhóm" key="all" />
          {teams.map(team => (
            <TabPane 
              tab={
                <span>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  {team.name}
                </span>
              } 
              key={team.id.toString()}
            />
          ))}
        </Tabs>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm kiếm công việc nhóm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Team Tasks Board */}
      <TaskBoard
        tasks={filteredTasks}
        onEditTask={(task) => {
          setEditingTask(task);
          setModalVisible(true);
        }}
        onDeleteTask={handleDeleteTask}
        onTaskMove={handleTaskMove}
      />

      {/* Team Task Form Modal */}
      <Modal
        title={editingTask ? "Chỉnh sửa công việc nhóm" : "Tạo Công Việc Nhóm"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <TaskForm
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingTask(null);
          }}
          onFinish={handleFormFinish}
          initialValues={editingTask}
          loading={loading}
          users={users}
        />
      </Modal>
    </div>
  );
};

export default TeamTasks;