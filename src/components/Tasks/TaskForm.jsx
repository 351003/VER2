import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const TaskForm = ({ visible, onCancel, onFinish, initialValues, loading, users = [], showAssignee = true }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleFinish = (values) => {
    onFinish({
      ...values,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
    >
      <Form.Item
        name="title"
        label="Tiêu đề công việc"
        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề công việc!' }]}
      >
        <Input placeholder="Nhập tiêu đề công việc" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
      >
        <TextArea 
          rows={4} 
          placeholder="Nhập mô tả chi tiết cho công việc..." 
        />
      </Form.Item>

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

      <Form.Item
        name="status"
        label="Trạng thái"
        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
      >
        <Select placeholder="Chọn trạng thái">
          <Option value="backlog">Tồn đọng</Option>
          <Option value="todo">Chưa bắt đầu</Option>
          <Option value="in-progress">Đang thực hiện</Option>
          <Option value="done">Hoàn thành</Option>
        </Select>
      </Form.Item>
    {showAssignee && (
      <Form.Item
        name="assigneeId"
        label="Người phụ trách"
      >
        <Select 
          placeholder="Chọn người phụ trách"
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
      )}
      <Form.Item
        name="dueDate"
        label="Hạn hoàn thành"
      >
        <DatePicker 
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày hết hạn"
        />
      </Form.Item>

      <Form.Item
        name="tags"
        label="Thẻ"
      >
        <Select
          mode="tags"
          placeholder="Thêm thẻ"
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
            {initialValues ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TaskForm;