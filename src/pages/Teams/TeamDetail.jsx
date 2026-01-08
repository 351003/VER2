import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  List,
  Avatar,
  Space,
  Tabs,
  Descriptions,
  Divider,
  Breadcrumb,
  
  Typography,
  Button,
  Table,
  Timeline,
  Badge,
  Spin,
  message,
  Modal
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  ProjectOutlined,
  MessageOutlined,
  PoweroffOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { teamService } from '../../services/teamService';
import projectService from '../../services/projectService';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import TeamForm from '../../components/Teams/TeamForm';
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderInfo, setLeaderInfo] = useState(null);
  const [managerInfo, setManagerInfo] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
   const [users, setUsers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null); // Thêm state cho project info
  const [loadingProject, setLoadingProject] = useState(false); // Thêm loading cho project
  const { user } = useAuth(); // Thêm user từ AuthContext
  useEffect(() => {
    loadTeamDetail();
    loadUsers();

  }, [id]);
  // Thêm các hàm load users và projects
  const loadUsers = async () => {
    try {
      const response = await userService.getUsers({
        page: 1,
        limit: 100,
      });

      if (response.success) {
        setUsers(
          response.data.map((u) => ({
            id: u._id,
            name: u.fullName,
            email: u.email,
            avatar: u.avatar,
          }))
        );
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách user:', error);
    }
  };

  // Thêm hàm load project info
  const loadProjectInfo = async (projectId) => {
    if (!projectId) return;
    
    setLoadingProject(true);
    try {
      // Giả sử bạn có endpoint /projects/detail/:id hoặc /projects/:id
      const response = await projectService.getProjectDetail(projectId);
      
      if (response.success && response.data) {
        setProjectInfo({
          id: response.data._id,
          title: response.data.title,
          description: response.data.description,
          status: response.data.status
        });
      } else {
        // Nếu không lấy được, vẫn hiển thị ID
        setProjectInfo({
          id: projectId,
          title: `Dự án ID: ${projectId.substring(0, 8)}...`,
          description: 'Không có mô tả',
          status: 'unknown'
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin dự án:', error);
      // Nếu lỗi, vẫn hiển thị ID
      setProjectInfo({
        id: projectId,
        title: `Dự án ID: ${projectId.substring(0, 8)}...`,
        description: 'Không tải được thông tin',
        status: 'error'
      });
    } finally {
      setLoadingProject(false);
    }
  };

  const loadTeamDetail = async () => {
    setLoading(true);
    try {
      const response = await teamService.getTeamDetail(id);
      
      if (response.success && response.data) {
        const teamData = response.data;
        setTeam(teamData);
        
        // Load leader và manager info
        if (teamData.leader) {
          loadUserInfo(teamData.leader, setLeaderInfo);
        }
        if (teamData.manager) {
          loadUserInfo(teamData.manager, setManagerInfo);
        }
        // Load project info nếu có project_id
        if (teamData.project_id) {
          loadProjectInfo(teamData.project_id);
        }
        
        // Load members info
        if (teamData.listUser && teamData.listUser.length > 0) {
          loadMembersInfo(teamData.listUser);
        }
      } else {
        message.error(response.message || 'Không tìm thấy team');
        navigate('/teams');
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin team: ' + error.message);
      navigate('/teams');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xử lý chỉnh sửa
  const handleEditClick = () => {
    setEditingTeam(team);
    setModalVisible(true);
  };

  // Thêm hàm xử lý cập nhật team
  const handleUpdateTeam = async (values) => {
    try {
      setFormLoading(true);
      const response = await teamService.updateTeam(id, values);

      if (response.code === 200) {
        message.success('Cập nhật nhóm thành công!');
        setModalVisible(false);
        setEditingTeam(null);
        loadTeamDetail(); // Reload thông tin team
      } else {
        message.error(response.message || 'Lỗi khi cập nhật nhóm');
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật nhóm: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTeam(null);
  };

  const loadUserInfo = async (userId, setter) => {
    try {
      // Sử dụng userService để lấy user by id
      const response = await userService.getUserById(userId);
      if (response) {
        setter({
          id: userId,
          name: response.fullName,
          email: response.email,
          avatar: response.avatar
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin user:', error);
      // Nếu không lấy được từ API, hiển thị ID
      setter({
        id: userId,
        name: 'User ID: ' + userId.substring(0, 8),
        email: 'N/A',
        avatar: null
      });
    }
  };
  const handleToggleActive = async (isActive) => {
    try {
      const response = await teamService.toggleActive(id, isActive);
      
      if (response.code === 200) {
        message.success(`Đã ${isActive ? "kích hoạt" : "tạm dừng"} nhóm thành công!`);
        loadTeamDetail(); // Reload thông tin team
      } else {
        message.error(response.message || "Lỗi khi cập nhật trạng thái");
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái: " + error.message);
    }
  };

  const loadMembersInfo = async (userIds) => {
    setLoadingUsers(true);
    try {
      // Lấy tất cả users từ service
      const usersResponse = await userService.getUsers({ limit: 100 });
      
      if (usersResponse.success) {
        const usersMap = {};
        usersResponse.data.forEach(user => {
          usersMap[user._id] = {
            id: user._id,
            name: user.fullName,
            email: user.email,
            avatar: user.avatar
          };
        });
        
        // Map userIds với thông tin user
        const membersData = userIds.map(userId => {
          if (usersMap[userId]) {
            return usersMap[userId];
          }
          return {
            id: userId,
            name: 'User ID: ' + userId.substring(0, 8),
            email: 'N/A',
            avatar: null
          };
        });
        
        setMembers(membersData);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin thành viên:', error);
      // Nếu lỗi, hiển thị ID thay vì tên
      const membersData = userIds.map(userId => ({
        id: userId,
        name: 'User ID: ' + userId.substring(0, 8),
        email: 'N/A',
        avatar: null
      }));
      setMembers(membersData);
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading || !team) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const memberColumns = [
    {
      title: 'Thành viên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Vai trò',
      key: 'role',
      render: (_, record) => {
        if (record.id === team.leader?.toString()) {
          return <Tag color="gold">Leader</Tag>;
        }
        if (record.id === team.manager?.toString()) {
          return <Tag color="blue">Manager</Tag>;
        }
        return <Tag>Member</Tag>;
      }
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/teams')}>Nhóm</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{team.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Team Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/teams')}
                style={{ marginRight: 12 }}
              />
              <TeamOutlined style={{ color: '#1890ff', fontSize: '24px', marginRight: 12 }} />
              <Title level={2} style={{ margin: 0, marginRight: 16 }}>
                {team.name}
              </Title>
              <Tag color={team.isActive ? 'success' : 'default'}>
                {team.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
              </Tag>
            </div>
            
            <Text style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', display: 'block', marginBottom: 12 }}>
              {team.description || 'Không có mô tả'}
            </Text>
          </div>

          <Space>
            {/* Chỉ hiển thị nút toggle active khi có quyền */}
            {(team.leader === user?.id || team.manager === user?.id || user?.role.toUpperCase() === 'MANAGER') && (
              <Button 
                icon={<PoweroffOutlined />}
                onClick={() => handleToggleActive(!team.isActive)}
                type={team.isActive ? "default" : "primary"}
                danger={team.isActive}
              >
                {team.isActive ? "Tạm dừng" : "Kích hoạt"}
              </Button>
            )}
            
            {/* Sửa nút Chỉnh sửa để mở modal thay vì navigate */}
            {(team.leader === user?.id || team.manager === user?.id || user?.role.toUpperCase() === 'MANAGER') && (
              <Button icon={<EditOutlined />} type="primary" onClick={handleEditClick}>
                Chỉnh sửa
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Team Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Thành viên"
              value={team.listUser?.length || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Trạng thái"
              value={team.isActive ? 'Hoạt động' : 'Dừng'}
              valueStyle={{ color: team.isActive ? '#52c41a' : '#ff4d4f' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Ngày tạo"
              value={formatDate(team.createdAt).split(' ')[0]}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Cập nhật"
              value={formatDate(team.updatedAt).split(' ')[0]}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Team Details & Members */}
        <Col xs={24} lg={8}>
          {/* Team Information */}
          <Card title="Thông tin nhóm" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              {/* <Descriptions.Item label="ID nhóm">
                <Text copyable>{team._id}</Text>
              </Descriptions.Item> */}
              <Descriptions.Item label="Dự án">
                {team.project_id ? (
                  loadingProject ? (
                    <Spin size="small" />
                  ) : projectInfo ? (
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <div>
                        <ProjectOutlined style={{ color: '#1890ff', marginRight: 6 }} />
                        <Text strong>{projectInfo.title}</Text>
                      </div>
                      <div>
                        {/* <Tag color={
                          projectInfo.status === 'active' ? 'success' : 
                          projectInfo.status === 'completed' ? 'blue' : 
                          projectInfo.status === 'pending' ? 'orange' : 'default'
                        } size="small">
                          {projectInfo.status === 'active' ? 'Đang thực hiện' : 
                           projectInfo.status === 'completed' ? 'Hoàn thành' : 
                           projectInfo.status === 'pending' ? 'Chờ xử lý' : 
                           projectInfo.status}
                        </Tag> */}
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<LinkOutlined />}
                          onClick={() => navigate(`/projects/detail/${projectInfo.id}`)}
                          style={{ padding: 0, marginLeft: 8 }}
                        >
                          Xem dự án
                        </Button>
                      </div>
                      {/* <Text type="secondary" style={{ fontSize: '11px' }}>
                        ID: {team.project_id.substring(0, 8)}...
                      </Text> */}
                    </Space>
                  ) : (
                    <Space>
                      <ProjectOutlined style={{ color: '#666', marginRight: 6 }} />
                      <Text copyable>{team.project_id.substring(0, 8)}...</Text>
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<LinkOutlined />}
                        onClick={() => navigate(`/projects/${team.project_id}`)}
                        style={{ padding: 0 }}
                      >
                        Xem dự án
                      </Button>
                    </Space>
                  )
                ) : (
                  <Text type="secondary">Không có dự án</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trưởng nhóm">
                {leaderInfo ? (
                  <Space>
                    <Avatar size="small" src={leaderInfo.avatar} icon={<UserOutlined />} />
                    <div>
                      <div>{leaderInfo.name}</div>
                      <Text type="secondary" style={{ fontSize: '11px' }}>{leaderInfo.email}</Text>
                    </div>
                  </Space>
                ) : team.leader ? (
                  <Text copyable>{team.leader}</Text>
                ) : (
                  <Text type="secondary">Không có</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Quản lý">
                {managerInfo ? (
                  <Space>
                    <Avatar size="small" src={managerInfo.avatar} icon={<UserOutlined />} />
                    <div>
                      <div>{managerInfo.name}</div>
                      <Text type="secondary" style={{ fontSize: '11px' }}>{managerInfo.email}</Text>
                    </div>
                  </Space>
                ) : team.manager ? (
                  <Text copyable>{team.manager}</Text>
                ) : (
                  <Text type="secondary">Không có</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(team.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật">
                {formatDate(team.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Team Members */}
          <Card title={`Thành viên (${members.length})`} style={{ marginBottom: 16 }}>
            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : (
              <>
                <Table
                  dataSource={members}
                  columns={memberColumns}
                  pagination={false}
                  rowKey="id"
                  size="small"
                />
                {team.listUser && team.listUser.length > members.length && (
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <Text type="secondary">
                      Hiển thị {members.length}/{team.listUser.length} thành viên
                    </Text>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="info">
              <TabPane tab="Thông tin chi tiết" key="info">
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Tên nhóm" span={2}>
                    {team.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả" span={2}>
                    {team.description || 'Không có mô tả'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={team.isActive ? 'success' : 'default'}>
                      {team.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số thành viên">
                    {team.listUser?.length || 0}
                  </Descriptions.Item>
                  {/* <Descriptions.Item label="Leader ID">
                    <Text copyable>{team.leader}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Manager ID">
                    {team.manager ? (
                      <Text copyable>{team.manager}</Text>
                    ) : (
                      <Text type="secondary">Không có</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Project ID" span={2}>
                    {team.project_id ? (
                      <Text copyable>{team.project_id}</Text>
                    ) : (
                      <Text type="secondary">Không có</Text>
                    )}
                  </Descriptions.Item> */}
                </Descriptions>
              </TabPane>

              <TabPane tab="Hoạt động" key="activities">
                <Timeline>
                  <Timeline.Item color="green" dot={<TeamOutlined />}>
                    <p>Nhóm được tạo</p>
                    <Text type="secondary">{formatDate(team.createdAt)}</Text>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <p>Cập nhật lần cuối</p>
                    <Text type="secondary">{formatDate(team.updatedAt)}</Text>
                  </Timeline.Item>
                  {team.deleted && (
                    <Timeline.Item color="red">
                      <p>Nhóm bị xóa</p>
                      <Text type="secondary">{formatDate(team.deletedAt)} bởi {team.deletedBy}</Text>
                    </Timeline.Item>
                  )}
                </Timeline>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    {/* Modal Form Chỉnh sửa */}
      <Modal
        title="Chỉnh sửa nhóm"
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <TeamForm
          visible={modalVisible}
          onCancel={handleModalCancel}
          onFinish={handleUpdateTeam}
          initialValues={editingTeam}
          loading={formLoading}
          users={users}
          editingTeam={editingTeam}
        />
      </Modal>
    </div>
  );
};

export default TeamDetail;