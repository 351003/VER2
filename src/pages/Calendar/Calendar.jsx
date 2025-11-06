import React, { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Modal,
  message,
  Card,
  Typography,
  Row,
  Col,
  Tabs,
  List,
  Tag,
  Avatar,
  Badge
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import CalendarView from '../../components/Calendar/CalendarView';
import EventForm from '../../components/Calendar/EventForm';

const { Title } = Typography;
const { TabPane } = Tabs;

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('calendar');

  // Mock data
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', avatar: null },
    { id: 2, name: 'Trần Thị B', email: 'b@example.com', avatar: null },
    { id: 3, name: 'Lê Văn C', email: 'c@example.com', avatar: null },
    { id: 4, name: 'Phạm Thị D', email: 'd@example.com', avatar: null }
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    setLoading(true);
    // Mock events data
    const mockEvents = [
      {
        id: 1,
        title: 'Họp nhóm Frontend',
        description: 'Họp định kỳ nhóm Frontend để review tiến độ và phân công công việc mới',
        type: 'meeting',
        color: '#1890ff',
        start: '2024-01-20T09:00:00',
        end: '2024-01-20T10:30:00',
        assignee: users[0],
        participants: [users[0], users[1], users[2]],
        location: 'Phòng họp A',
        isAllDay: false
      },
      {
        id: 2,
        title: 'Deadline Design System',
        description: 'Hạn hoàn thành thiết kế hệ thống component',
        type: 'deadline',
        color: '#ff4d4f',
        start: '2024-01-22T17:00:00',
        end: '2024-01-22T17:00:00',
        assignee: users[3],
        participants: [users[3]],
        isAllDay: false
      },
      {
        id: 3,
        title: 'Demo sản phẩm',
        description: 'Demo phiên bản mới cho khách hàng',
        type: 'event',
        color: '#722ed1',
        start: '2024-01-25T14:00:00',
        end: '2024-01-25T16:00:00',
        assignee: users[1],
        participants: [users[0], users[1], users[2], users[3]],
        location: 'Phòng họp chính',
        isAllDay: false
      },
      {
        id: 4,
        title: 'Code Review',
        description: 'Review code cho module authentication',
        type: 'task',
        color: '#52c41a',
        start: '2024-01-18T15:00:00',
        end: '2024-01-18T16:30:00',
        assignee: users[2],
        participants: [users[0], users[2]],
        isAllDay: false
      },
      {
        id: 5,
        title: 'Training React Hooks',
        description: 'Buổi training về React Hooks cho team',
        type: 'event',
        color: '#faad14',
        start: '2024-01-30T13:00:00',
        end: '2024-01-30T15:00:00',
        assignee: users[0],
        participants: [users[0], users[1], users[2]],
        location: 'Phòng training',
        isAllDay: false
      }
    ];
    setEvents(mockEvents);
    setLoading(false);
  };

  const handleCreateEvent = (values) => {
    const newEvent = {
      id: Date.now(),
      ...values,
      color: getEventTypeColor(values.type),
      createdAt: new Date().toISOString()
    };

    setEvents(prev => [newEvent, ...prev]);
    message.success('Tạo sự kiện thành công!');
    setModalVisible(false);
  };

  const handleUpdateEvent = (values) => {
    setEvents(prev => prev.map(event =>
      event.id === editingEvent.id
        ? { ...event, ...values, color: getEventTypeColor(values.type) }
        : event
    ));
    message.success('Cập nhật sự kiện thành công!');
    setModalVisible(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sự kiện này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        message.success('Xóa sự kiện thành công!');
      }
    });
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setModalVisible(true);
  };

  const handleFormFinish = (values) => {
    if (editingEvent) {
      handleUpdateEvent(values);
    } else {
      handleCreateEvent(values);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingEvent(null);
  };

  const getEventTypeColor = (type) => {
    const typeColors = {
      'meeting': '#1890ff',
      'deadline': '#ff4d4f',
      'task': '#52c41a',
      'event': '#722ed1',
      'reminder': '#faad14'
    };
    return typeColors[type] || '#1890ff';
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 5);
  };

  const upcomingEvents = getUpcomingEvents();

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <CalendarOutlined style={{ marginRight: 12, color: '#1890ff' }} />
              Lịch Làm Việc
            </Title>
            <p style={{ margin: 0, color: '#666' }}>
              Quản lý lịch trình và sự kiện của bạn
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Tạo Sự Kiện
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Calendar View */}
        <Col xs={24} lg={17}>
          <Card>
            <Tabs
              activeKey={activeView}
              onChange={setActiveView}
              items={[
                {
                  key: 'calendar',
                  label: 'Lịch',
                  children: (
                    <CalendarView
                      events={events}
                      onEventClick={handleEditEvent}
                      onDateSelect={(date) => {
                        setEditingEvent(null);
                        setModalVisible(true);
                      }}
                    />
                  )
                },
                {
                  key: 'list',
                  label: 'Danh sách sự kiện',
                  children: (
                    <List
                      dataSource={events}
                      renderItem={(event) => (
                        <List.Item
                          actions={[
                            <Button type="link" onClick={() => handleEditEvent(event)}>
                              Chỉnh sửa
                            </Button>,
                            <Button type="link" danger onClick={() => handleDeleteEvent(event.id)}>
                              Xóa
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                style={{ backgroundColor: event.color }} 
                                icon={<CalendarOutlined />} 
                              />
                            }
                            title={
                              <Space>
                                <span>{event.title}</span>
                                <Tag color={event.color}>
                                  {event.type === 'meeting' ? 'Cuộc họp' : 
                                   event.type === 'deadline' ? 'Hạn chót' : 
                                   event.type === 'task' ? 'Công việc' : 
                                   event.type === 'event' ? 'Sự kiện' : 'Nhắc nhở'}
                                </Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" size={0}>
                                <div>
                                  <ClockCircleOutlined /> {new Date(event.start).toLocaleString('vi-VN')}
                                  {event.end && ` - ${new Date(event.end).toLocaleString('vi-VN')}`}
                                </div>
                                {event.location && (
                                  <div>
                                    📍 {event.location}
                                  </div>
                                )}
                                {event.assignee && (
                                  <div>
                                    <UserOutlined /> {event.assignee.name}
                                  </div>
                                )}
                                {event.description && (
                                  <div style={{ color: '#666', fontSize: '13px' }}>
                                    {event.description}
                                  </div>
                                )}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )
                }
              ]}
            />
          </Card>
        </Col>

        {/* Sidebar - Upcoming Events */}
        <Col xs={24} lg={7}>
          <Card title="Sự kiện sắp tới" style={{ marginBottom: 16 }}>
            {upcomingEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <CalendarOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                <div>Không có sự kiện sắp tới</div>
              </div>
            ) : (
              <List
                dataSource={upcomingEvents}
                renderItem={(event) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Badge color={event.color} />
                      }
                      title={
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          {event.title}
                        </div>
                      }
                      description={
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <div>{new Date(event.start).toLocaleDateString('vi-VN')}</div>
                          <div>{new Date(event.start).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          {/* Event Statistics */}
          <Card title="Thống kê sự kiện">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cuộc họp</span>
                <Tag color="blue">{events.filter(e => e.type === 'meeting').length}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hạn chót</span>
                <Tag color="red">{events.filter(e => e.type === 'deadline').length}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Công việc</span>
                <Tag color="green">{events.filter(e => e.type === 'task').length}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sự kiện</span>
                <Tag color="purple">{events.filter(e => e.type === 'event').length}</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tổng số</span>
                <Tag>{events.length}</Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Event Form Modal */}
      <Modal
        title={editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <EventForm
          visible={modalVisible}
          onCancel={handleModalCancel}
          onFinish={handleFormFinish}
          initialValues={editingEvent}
          loading={loading}
          users={users}
        />
      </Modal>
    </div>
  );
};

export default CalendarPage;