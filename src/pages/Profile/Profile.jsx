import React, { useState } from 'react';
import { Card, Avatar, Form, Input, Button, Upload, Space, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, setUser: _unused, logout } = useAuth();
  // Note: AuthContext doesn't export setUser; we'll update via localStorage and a small local state
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const initial = user || {};

  const onFinish = (values) => {
    setLoading(true);
    try {
      // merge and persist to localStorage (mocking API)
      const updated = {
        ...initial,
        name: values.name,
        email: values.email,
        avatar: values.avatar || initial.avatar
      };

      localStorage.setItem('user', JSON.stringify(updated));

      // update window-level auth state by dispatching a custom event that AuthProvider can listen to
      window.dispatchEvent(new CustomEvent('auth:user-updated', { detail: updated }));

      message.success('Cập nhật profile thành công');
    } catch (err) {
      console.error(err);
      message.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ maxWidth: 800, margin: '24px auto' }}>
      <Card title="Thông tin cá nhân">
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            name: initial.name || `${initial.profile?.firstName || ''} ${initial.profile?.lastName || ''}`.trim(),
            email: initial.email || '',
            avatar: initial.avatar || ''
          }}
          onFinish={onFinish}
        >
          <Form.Item label="Avatar">
            <Space align="center">
              <Avatar size={64} src={initial.avatar} style={{ backgroundColor: '#87d068' }}>
                {(!initial.avatar && initial.name) ? initial.name[0] : null}
              </Avatar>
              <Form.Item name="avatar" noStyle>
                <Upload
                  beforeUpload={() => false}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                </Upload>
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Đổi mật khẩu (mock)">
            <Input.Password placeholder="Nhập mật khẩu mới (chỉ mock)" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleLogout}>Đăng xuất</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Cập nhật</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
