// pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Card, List, Tag, Spin, Alert, Button, Typography, Space } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ProjectOutlined,
  UserOutlined,
  ReloadOutlined,
  BellOutlined,
} from "@ant-design/icons";
import StatCard from "../../components/Common/StatCard";
import ChartCard from "../../components/Common/ChartCard";
import { useAuth } from "../../contexts/AuthContext";
import { dashboardService } from "../../services/dashboardService";
import PosterBell from "../../components/Article/SystemArticleMini";

const { Text } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role || "guest";

  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [statCards, setStatCards] = useState([]);
  const [taskChartData, setTaskChartData] = useState(null);
  const [projectChartData, setProjectChartData] = useState(null);
  const [simpleNotifications, setSimpleNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchSimpleNotifications();
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching dashboard data...");

      const data = await dashboardService.getDashboardData();
      console.log("✅ Dashboard data received:", data);

      setDashboardData(data);

      // 1. Cập nhật stat cards
      const stats = dashboardService.getStatCardsData(data, userRole);
      console.log("📊 Stat cards data:", stats);
      updateStatCards(stats, userRole);

      // 2. Cập nhật chart data
      if (userRole === "user" || userRole === "USER") {
        const taskChart = dashboardService.getTaskDistributionData(data);
        setTaskChartData(taskChart);
      }

      // FIX: Sử dụng dữ liệu thực từ API
      const projectChart = dashboardService.getProjectDistributionData(data);
      console.log("📈 Project chart from service:", projectChart);
      setProjectChartData(projectChart);

    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Lấy 3 notifications đơn giản - CHO CẢ USER VÀ MANAGER
  const fetchSimpleNotifications = async () => {
    try {
      setNotificationsLoading(true);
      
      const notifications = await dashboardService.getSimpleNotifications(3);
      setSimpleNotifications(notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setSimpleNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const updateStatCards = (stats, role) => {
    let cards = [];

    if (role === "user" || role === "USER") {
      cards = [
        {
          title: "Total Tasks",
          value: stats.totalTasks || 0,
          icon: <CheckCircleOutlined />,
          color: "#1890ff",
        },
        {
          title: "Pending",
          value: stats.pendingTasks || 0,
          icon: <ClockCircleOutlined />,
          color: "#faad14",
        },
        {
          title: "Team Tasks",
          value: stats.teamTasks || 0,
          icon: <TeamOutlined />,
          color: "#52c41a",
        },
      ];
    } else if (role === "manager" || role === "MANAGER") {
      cards = [
        {
          title: "Total Projects",
          value: stats.totalProjects || 0,
          icon: <ProjectOutlined />,
          color: "#1890ff",
        },
        {
          title: "My Projects",
          value: stats.totalPM || 0,
          icon: <UserOutlined />,
          color: "#13c2c2",
        },
        {
          title: "Pending Projects",
          value: stats.pendingProjects || 0,
          icon: <ClockCircleOutlined />,
          color: "#faad14",
        },
        {
          title: "Team Projects",
          value: stats.teamProjects || 0,
          icon: <TeamOutlined />,
          color: "#52c41a",
        },
      ];
    }

    console.log("🎯 Stat cards to display:", cards);
    setStatCards(cards);
  };
  

  // Render notification item đơn giản
  const renderNotificationItem = (notification) => (
    <List.Item 
      style={{ 
        padding: "12px 0", 
        borderBottom: "1px solid #f0f0f0",
        background: notification.isRead ? "transparent" : "#f6ffed",
        borderRadius: 6,
        marginBottom: 4,
      }}
    >
      <div style={{ width: "100%" }}>
        {/* Message */}
        <Text
          style={{
            fontSize: 14,
            display: "block",
            marginBottom: 6,
            lineHeight: 1.4,
            color: notification.isRead ? "#666" : "#000",
            fontWeight: notification.isRead ? "normal" : "500",
          }}
        >
          {notification.message}
        </Text>
        
        {/* Time và Tags */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
        }}>
          {/* Time */}
          <Text type="secondary" style={{ fontSize: 12 }}>
            <ClockCircleOutlined style={{ marginRight: 4, fontSize: 11 }} />
            {dashboardService.formatTimeShort(notification.createdAt)}
          </Text>
          
          {/* Tags */}
          <Space size={4}>
            <Tag 
              color={dashboardService.getTypeColor(notification.type)} 
              size="small"
              style={{ fontSize: 10 }}
            >
              {notification.type}
            </Tag>
            
            {notification.priority && notification.priority !== "normal" && (
              <Tag
                color={dashboardService.getPriorityColor(notification.priority)}
                size="small"
                style={{ fontSize: 10 }}
              >
                {notification.priority === "high" ? "Cao" : 
                 notification.priority === "medium" ? "Trung" : "Thấp"}
              </Tag>
            )}
          </Space>
        </div>
      </div>
    </List.Item>
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        action={
          <Button
            type="link"
            onClick={fetchDashboardData}
            icon={<ReloadOutlined />}
            style={{ marginLeft: "10px" }}
          >
            Thử lại
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <PosterBell />
      {/* Statistics Cards */}
      <Row gutter={[24, 24]}>
        {statCards.map((card, index) => (
          <Col key={index} xs={24} sm={12} lg={statCards.length > 4 ? 4 : 6}>
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
          </Col>
        ))}
      </Row>

      {/* Charts and Notifications */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Manager: Project Chart + Notifications */}
        {userRole === "manager" || userRole === "MANAGER" ? (
          <>
            <Col xs={24} lg={16}>
              <ChartCard
                title="Project Distribution"
                labels={projectChartData?.labels || []}
                data={projectChartData?.data || []}
                colors={projectChartData?.colors || []}
                type="doughnut"
              />
            </Col>

            <Col xs={24} lg={8}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BellOutlined style={{ color: '#1890ff' }} />
                    <span>Recent Activities</span>
                  </div>
                }
                bordered={false}
                bodyStyle={{ padding: "16px" }}
              >
                {notificationsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="small" />
                    <p style={{ marginTop: 8, fontSize: 12 }}>Đang tải thông báo...</p>
                  </div>
                ) : simpleNotifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    <BellOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                    <p style={{ fontSize: 13 }}>Chưa có thông báo nào</p>
                  </div>
                ) : (
                  <List
                    dataSource={simpleNotifications}
                    renderItem={renderNotificationItem}
                    size="small"
                    locale={{ emptyText: 'Không có thông báo' }}
                  />
                )}
              </Card>
            </Col>
          </>
        ) : (
          // User: Task Chart + Notifications
          <>
            <Col xs={24} lg={12}>
              <ChartCard
                title="Task Distribution"
                labels={taskChartData?.labels || []}
                data={taskChartData?.data || []}
                colors={taskChartData?.colors || []}
                type="doughnut"
              />
            </Col>

            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BellOutlined style={{ color: '#1890ff' }} />
                    <span>Recent Activities</span>
                  </div>
                }
                bordered={false}
                bodyStyle={{ padding: "16px" }}
              >
                {notificationsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="small" />
                    <p style={{ marginTop: 8, fontSize: 12 }}>Đang tải thông báo...</p>
                  </div>
                ) : simpleNotifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    <BellOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                    <p style={{ fontSize: 13 }}>Chưa có thông báo nào</p>
                  </div>
                ) : (
                  <List
                    dataSource={simpleNotifications}
                    renderItem={renderNotificationItem}
                    size="small"
                    locale={{ emptyText: 'Không có thông báo' }}
                  />
                )}
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
};

export default Dashboard;