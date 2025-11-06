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
  Drawer
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  MessageOutlined,
  AppstoreOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TeamCard from '../../components/Teams/TeamCard';
import TeamForm from '../../components/Teams/TeamForm';
import TeamChat from '../../components/Chat/TeamChat';
import { useAuth } from '../../contexts/AuthContext';
import PermissionWrapper from '../../components/Common/PermissionWrapper';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [chatDrawerVisible, setChatDrawerVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Mock data
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', avatar: null, isOnline: true },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com', avatar: null, isOnline: true },
    { id: 3, name: 'Lê Văn C', email: 'c@example.com', avatar: null, isOnline: false },
    { id: 4, name: 'Phạm Thị D', email: 'd@example.com', avatar: null, isOnline: true },
    { id: 5, name: 'Hoàng Văn E', email: 'e@example.com', avatar: null, isOnline: false }
  ];

  const currentUser = users[0];
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    filterTeams();
  }, [teams, searchText, filterStatus, activeTab]);

  const loadTeams = () => {
    setLoading(true);
    // Mock teams data
    const mockTeams = [
      {
        id: 1,
        name: 'Frontend Development',
        description: 'Nhóm phát triển giao diện người dùng với React, Vue và Angular',
        isPrivate: false,
        isActive: true,
        members: [users[0], users[1], users[2]],
        memberCount: 3,
        projectCount: 5,
        totalTasks: 45,
        completedTasks: 32,
        tags: ['frontend', 'react', 'vue', 'javascript'],
        recentActivity: 'Hoàn thành component library',
        createdAt: '2024-01-01'
      },
      {
        id: 2,
        name: 'Backend Team',
        description: 'Nhóm phát triển hệ thống backend với Node.js, Python và database',
        isPrivate: false,
        isActive: true,
        members: [users[2], users[3]],
        memberCount: 2,
        projectCount: 3,
        totalTasks: 28,
        completedTasks: 18,
        tags: ['backend', 'nodejs', 'python', 'database'],
        recentActivity: 'Deploy API version 2.0',
        createdAt: '2024-01-05'
      },
      {
        id: 3,
        name: 'UI/UX Design',
        description: 'Nhóm thiết kế giao diện và trải nghiệm người dùng',
        isPrivate: true,
        isActive: true,
        members: [users[1], users[4]],
        memberCount: 2,
        projectCount: 4,
        totalTasks: 22,
        completedTasks: 15,
        tags: ['design', 'ui/ux', 'figma', 'prototype'],
        recentActivity: 'Thiết kế wireframe mới',
        createdAt: '2024-01-10'
      },
      {
        id: 4,
        name: 'Quality Assurance',
        description: 'Nhóm kiểm thử chất lượng sản phẩm',
        isPrivate: false,
        isActive: false,
        members: [users[3]],
        memberCount: 1,
        projectCount: 2,
        totalTasks: 15,
        completedTasks: 8,
        tags: ['qa', 'testing', 'automation'],
        recentActivity: 'Hoàn thành test plan',
        createdAt: '2024-01-08'
      }
    ];
    setTeams(mockTeams);
    setLoading(false);
  };

  const filterTeams = () => {
    let filtered = teams;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchText.toLowerCase()) ||
        team.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (team.tags && team.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase())))
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(team => 
        filterStatus === 'active' ? team.isActive : !team.isActive
      );
    }

    // Filter by active tab
    if (activeTab !== 'all') {
      if (activeTab === 'active') {
        filtered = filtered.filter(team => team.isActive);
      } else if (activeTab === 'private') {
        filtered = filtered.filter(team => team.isPrivate);
      } else if (activeTab === 'inactive') {
        filtered = filtered.filter(team => !team.isActive);
      }
    }

    setFilteredTeams(filtered);
  };

  const handleCreateTeam = (values) => {
    if (!hasPermission('create_team')) {
      message.error('Bạn không có quyền tạo nhóm!');
      return;
    }

    const newTeam = {
      id: Date.now(),
      ...values,
      memberCount: values.members?.length || 0,
      projectCount: 0,
      totalTasks: 0,
      completedTasks: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTeams(prev => [newTeam, ...prev]);
    message.success('Tạo nhóm thành công!');
    setModalVisible(false);
  };

  const handleUpdateTeam = (values) => {
    if (!hasPermission('edit_team')) {
      message.error('Bạn không có quyền chỉnh sửa nhóm!');
      return;
    }
    setTeams(prev => prev.map(team =>
      team.id === editingTeam.id
        ? { 
            ...team, 
            ...values,
            memberCount: values.members?.length || 0
          }
        : team
    ));
    message.success('Cập nhật nhóm thành công!');
    setModalVisible(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (teamId) => {
    if (!hasPermission('delete_team')) {
      message.error('Bạn không có quyền xóa nhóm!');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa nhóm này? Tất cả dữ liệu liên quan sẽ bị mất.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        setTeams(prev => prev.filter(team => team.id !== teamId));
        message.success('Xóa nhóm thành công!');
      }
    });
  };
  const navigate = useNavigate();
  const handleViewTeam = (team) => {
    navigate(`/teams/${team.id}`);
    message.info(`Xem chi tiết nhóm: ${team.name}`);
    // TODO: Navigate to team detail page
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setModalVisible(true);
  };

  const handleChatTeam = (team) => {
    setSelectedTeam(team);
    setChatDrawerVisible(true);
  };

  const handleFormFinish = (values) => {
    if (editingTeam) {
      handleUpdateTeam(values);
    } else {
      handleCreateTeam(values);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTeam(null);
  };

  // Statistics
  const stats = {
    total: teams.length,
    active: teams.filter(t => t.isActive).length,
    private: teams.filter(t => t.isPrivate).length,
    members: teams.reduce((sum, team) => sum + team.memberCount, 0)
  };

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <TeamOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              Quản Lý Nhóm
            </Title>
            <p style={{ margin: 0, color: '#666' }}>
              Tạo và quản lý các nhóm làm việc hợp tác
            </p>
          </div>
          <PermissionWrapper permission="create_team">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Tạo Nhóm
          </Button>
          </PermissionWrapper>
        </div>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng số nhóm"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Nhóm đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Nhóm riêng tư"
              value={stats.private}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng thành viên"
              value={stats.members}
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
              label: `Tất cả (${teams.length})`
            },
            {
              key: 'active',
              label: `Đang hoạt động (${stats.active})`
            },
            {
              key: 'private',
              label: `Riêng tư (${stats.private})`
            },
            {
              key: 'inactive',
              label: `Ngừng hoạt động (${teams.filter(t => !t.isActive).length})`
            }
          ]}
        />

        <Row gutter={[16, 16]} style={{ marginTop: 16 }} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm kiếm nhóm..."
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
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
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

      {/* Teams Display */}
      {filteredTeams.length === 0 ? (
        <Card>
          <Empty
            description="Không tìm thấy nhóm nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTeams.map(team => (
            <Col 
              key={team.id} 
              xs={24} 
              sm={viewMode === 'list' ? 24 : 12} 
              lg={viewMode === 'list' ? 24 : 8}
              xl={viewMode === 'list' ? 24 : 6}
            >
              <TeamCard
                team={team}
                onView={handleViewTeam}
                onEdit={handleEditTeam}
                onDelete={handleDeleteTeam}
                onChat={handleChatTeam}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Team Form Modal */}
      <Modal
        title={editingTeam ? 'Chỉnh sửa nhóm' : 'Tạo nhóm mới'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <TeamForm
          visible={modalVisible}
          onCancel={handleModalCancel}
          onFinish={handleFormFinish}
          initialValues={editingTeam}
          loading={loading}
          users={users}
        />
      </Modal>

      {/* Team Chat Drawer */}
      <Drawer
        title={`Team Chat - ${selectedTeam?.name}`}
        placement="right"
        onClose={() => setChatDrawerVisible(false)}
        open={chatDrawerVisible}
        width={500}
      >
        {selectedTeam && (
          <TeamChat
            team={selectedTeam}
            currentUser={currentUser}
            onClose={() => setChatDrawerVisible(false)}
          />
        )}
      </Drawer>
    </div>
  );
};

export default Teams;