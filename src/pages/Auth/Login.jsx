import React from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('user');

  const onFinish = async (values) => {
    setLoading(true);
    
    let email, password;
    
    if (activeTab === 'admin') {
      email = 'admin@example.com';
      password = 'password';
    } else if (activeTab === 'manager') {
      email = 'manager@example.com';
      password = 'password';
    } else {
      email = 'user@example.com';
      password = 'password';
    }

    const result = await login(email, password);
    
    if (result.success) {
      message.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } else {
      message.error(result.message || 'Đăng nhập thất bại!');
    }
    setLoading(false);
  };

  const demoAccounts = {
    user: { email: 'user@example.com', password: 'password', role: 'Người dùng' },
    manager: { email: 'manager@example.com', password: 'password', role: 'Quản lý' },
    admin: { email: 'admin@example.com', password: 'password', role: 'Quản trị viên' }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card
        title="Đăng Nhập Hệ Thống"
        style={{
          width: 400,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Người Dùng" key="user">
            <LoginForm 
              loading={loading} 
              onFinish={onFinish}
              accountInfo={demoAccounts.user}
            />
          </TabPane>
          <TabPane tab="Quản Lý" key="manager">
            <LoginForm 
              loading={loading} 
              onFinish={onFinish}
              accountInfo={demoAccounts.manager}
            />
          </TabPane>
          <TabPane tab="Quản Trị" key="admin">
            <LoginForm 
              loading={loading} 
              onFinish={onFinish}
              accountInfo={demoAccounts.admin}
            />
          </TabPane>
        </Tabs>

        <div style={{ textAlign: 'center', marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            <strong>Tài khoản demo:</strong>
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>
            Email: {demoAccounts[activeTab].email}<br />
            Password: {demoAccounts[activeTab].password}<br />
            Vai trò: {demoAccounts[activeTab].role}
          </div>
        </div>
      </Card>
    </div>
  );
};

const LoginForm = ({ loading, onFinish, accountInfo }) => {
  return (
    <Form
      name="login"
      onFinish={onFinish}
      autoComplete="off"
      size="large"
    >
      <Form.Item>
        <Input 
          value={accountInfo.email}
          readOnly
          prefix={<UserOutlined />} 
          style={{ background: '#fafafa' }}
        />
      </Form.Item>

      <Form.Item>
        <Input.Password
          value={accountInfo.password}
          readOnly
          prefix={<LockOutlined />}
          style={{ background: '#fafafa' }}
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          style={{ width: '100%' }}
          loading={loading}
        >
          Đăng Nhập với tài khoản {accountInfo.role}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Login;