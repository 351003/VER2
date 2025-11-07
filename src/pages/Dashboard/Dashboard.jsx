import React from 'react';
import { Row, Col, Card, Progress, List, Tag } from 'antd'; //, Watermark
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import StatCard from '../../components/Common/StatCard';
import ChartCard from '../../components/Common/ChartCard';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();// Lấy thông tin user từ context
  const userRole = user?.role || 'guest';
  const recentActivities = [
    {
      id: 1,
      user: 'You',
      action: 'completed',
      task: 'Design Homepage',
      time: '2 hours ago',
      type: 'success'
    },
    {
      id: 2,
      user: 'Trần Thị B',
      action: 'assigned you',
      task: 'Review API Documentation',
      time: '4 hours ago',
      type: 'info'
    },
    {
      id: 3,
      user: 'Lê Văn C',
      action: 'commented on',
      task: 'Mobile App Design',
      time: '1 day ago',
      type: 'warning'
    },
  ];

  const getActivityTag = (type) => {
    const colors = {
      success: 'green',
      info: 'blue',
      warning: 'orange',
    };
    return colors[type] || 'default';
  };

  return (
    // <Watermark content="TASK MANAGER">
      <div>
        {/* <h1 style={{ marginBottom: 24 }}>Dashboard</h1> */}
        
        {/* Statistics Cards */}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Tasks"
              value={24}
              icon={<CheckCircleOutlined />}
              color="#1890ff"
              // change="+12%"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Pending"
              value={8}
              icon={<ClockCircleOutlined />}
              color="#faad14"
              // change="+3%"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Team Tasks"
              value={16}
              icon={<TeamOutlined />}
              color="#52c41a"
              // change="+8%"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Productivity"
              value="86%"
              icon={<RiseOutlined />}
              color="#722ed1"
              // change="+5%"
            />
          </Col>
        </Row>

        {/* Charts and Progress */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <ChartCard
              title="Task Distribution"
              labels={['Completed', 'In Progress', 'Pending', 'Overdue']}
              data={[12, 6, 4, 2]}
              colors={['#52c41a', '#1890ff', '#faad14', '#f5222d']}
              type="doughnut"
            />
          </Col>
          {(userRole === 'manager') && (
          <Col xs={24} lg={12}>
            <Card title="Project Progress" bordered={false}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Website Redesign</span>
                  <span>75%</span>
                </div>
                <Progress percent={75} strokeColor="#1890ff" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Mobile App</span>
                  <span>45%</span>
                </div>
                <Progress percent={45} strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>API Development</span>
                  <span>90%</span>
                </div>
                <Progress percent={90} strokeColor="#722ed1" />
              </div>
            </Card>
          </Col>
          )}
        </Row>

        {/* Recent Activities */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {( userRole === 'manager') && (
          <Col xs={24} lg={12}>
            <Card title="Recent Activities" bordered={false}>
              <List
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div>
                          <span style={{ fontWeight: 500 }}>{item.user}</span>
                          <span> {item.action} </span>
                          <span style={{ fontWeight: 500 }}>{item.task}</span>
                        </div>
                      }
                      description={
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          marginTop: 4 
                        }}>
                          <Tag color={getActivityTag(item.type)}>
                            {item.type.toUpperCase()}
                          </Tag>
                          <span style={{ color: '#999', fontSize: 12 }}>
                            {item.time}
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          )}
          
          <Col xs={24} lg={(userRole === 'manager') ? 12 : 24}>
            <Card title="Upcoming Deadlines" bordered={false}>
              <List
                dataSource={[
                  { task: 'Finalize Design Mockups', date: 'Today, 5:00 PM', priority: 'high' },
                  { task: 'Team Meeting', date: 'Tomorrow, 9:00 AM', priority: 'medium' },
                  { task: 'Submit Monthly Report', date: 'Dec 15, 2024', priority: 'low' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.task}
                      description={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{item.date}</span>
                          <Tag color={item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'blue'}>
                            {item.priority}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    // </Watermark>
  );
};

export default Dashboard;