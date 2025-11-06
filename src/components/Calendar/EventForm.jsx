import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Avatar, Row, Col, Switch } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const EventForm = ({ visible, onCancel, onFinish, initialValues, loading, users = [] }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          dateRange: initialValues.start && initialValues.end ? 
            [moment(initialValues.start), moment(initialValues.end)] : null,
          participants: initialValues.participants?.map(p => p.id) || []
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleFinish = (values) => {
    const eventData = {
      ...values,
      start: values.dateRange[0].toISOString(),
      end: values.dateRange[1].toISOString(),
      participants: values.participants ? users.filter(user => values.participants.includes(user.id)) : [],
      assignee: users.find(user => user.id === values.assigneeId)
    };
    
    delete eventData.dateRange;
    delete eventData.assigneeId;
    
    onFinish(eventData);
  };

  const eventTypes = [
    { value: 'meeting', label: 'Cuộc họp', color: '#1890ff' },
    { value: 'deadline', label: 'Hạn chót', color: '#ff4d4f' },
    { value: 'task', label: 'Công việc', color: '#52c41a' },
    { value: 'event', label: 'Sự kiện', color: '#722ed1' },
    { value: 'reminder', label: 'Nhắc nhở', color: '#faad14' }
  ];

  const getEventTypeColor = (type) => {
    return eventTypes.find(t => t.value === type)?.color || '#1890ff';
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
            name="title"
            label="Tiêu đề sự kiện"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề sự kiện!' }]}
          >
            <Input placeholder="Nhập tiêu đề sự kiện" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết về sự kiện..." 
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="type"
            label="Loại sự kiện"
            rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện!' }]}
          >
            <Select placeholder="Chọn loại sự kiện">
              {eventTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  <Space>
                    <div 
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: type.color
                      }}
                    />
                    {type.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
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
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="dateRange"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <RangePicker
              showTime={{
                format: 'HH:mm',
              }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder={['Bắt đầu', 'Kết thúc']}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="participants"
        label="Thành viên tham gia"
      >
        <Select
          mode="multiple"
          placeholder="Chọn thành viên tham gia"
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

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="isAllDay"
            label="Cả ngày"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="isRecurring"
            label="Lặp lại"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="location"
        label="Địa điểm"
      >
        <Input placeholder="Nhập địa điểm..." />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Cập nhật' : 'Tạo sự kiện'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default EventForm;