import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, theme } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer'; // 👈 import Footer

const { Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar trái */}
      <Sidebar collapsed={collapsed} />

      {/* Phần nội dung chính */}
      <Layout
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Header cố định */}
        <Header
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        {/* Nội dung cuộn được, nằm giữa Header và Footer */}
        <Content
          style={{
            flex: 1,
            margin: '24px 16px',
            // marginTop: 88, // chừa khoảng cho header sticky
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>

        {/* Footer luôn ở dưới, không cuộn theo */}
        <Footer />
      </Layout>
    </Layout>
  );
};

export default MainLayout;
