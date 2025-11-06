import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Avatar, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ProjectForm = ({ visible, onCancel, onFinish, initialValues, loading, users = [], teams = [] }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          startDate: initialValues.startDate ? dayjs(initialValues.startDate) : null,
          dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
          teamMembers: initialValues.teamMembers?.map(m => m.id) || []
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleFinish = (values) => {
    onFinish({
      ...values,
      startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
      teamMembers: values.teamMembers ? users.filter(user => values.teamMembers.includes(user.id)) : []
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="name"
            label="Tên dự án"
            rules={[{ required: true, message: 'Vui lòng nhập tên dự án!' }]}
          >
            <Input placeholder="Nhập tên dự án" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="description"
            label="Mô tả dự án"
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết về dự án..." 
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="not-started">Chưa bắt đầu</Option>
              <Option value="in-progress">Đang thực hiện</Option>
              <Option value="on-hold">Tạm dừng</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên!' }]}
          >
            <Select placeholder="Chọn độ ưu tiên">
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="dueDate"
            label="Hạn hoàn thành"
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn hạn hoàn thành"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="teamId"
            label="Nhóm phụ trách"
          >
            <Select 
              placeholder="Chọn nhóm phụ trách"
              allowClear
            >
              {teams.map(team => (
                <Option key={team.id} value={team.id}>
                  {team.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="projectManager"
            label="Quản lý dự án"
          >
            <Select 
              placeholder="Chọn quản lý dự án"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small" src={user.avatar} icon={<UserOutlined />} />
                    <span>{user.name}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="teamMembers"
        label="Thành viên tham gia"
      >
        <Select
          mode="multiple"
          placeholder="Chọn thành viên tham gia dự án"
          optionFilterProp="children"
          showSearch
        >
          {users.map(user => (
            <Option key={user.id} value={user.id}>
              <Space>
                <Avatar size="small" src={user.avatar} icon={<UserOutlined />} />
                <span>{user.name}</span>
              </Space>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="tags"
        label="Thẻ dự án"
      >
        <Select
          mode="tags"
          placeholder="Thêm thẻ cho dự án"
          style={{ width: '100%' }}
          tokenSeparators={[',']}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Cập nhật' : 'Tạo dự án'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProjectForm;