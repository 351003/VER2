// components/Projects/ProjectForm.jsx
import React, { useEffect, useState } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Avatar, 
  Row, 
  Col, 
  Upload, 
  message,
  Spin,
  Typography,
  Tag,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  PlusOutlined,
  LoadingOutlined,
  ProjectOutlined,
  CalendarOutlined,
  TeamOutlined,
  CrownOutlined,
  InfoCircleOutlined,
  CheckOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ProjectForm = ({ 
  visible, 
  onCancel, 
  onFinish, 
  initialValues, 
  loading, 
  users = [], 
  currentUser,
  isParentProject = true,
  autoAssignToCreator = true // Thêm prop này để tự động assign người tạo là phụ trách
}) => {
  const [form] = Form.useForm();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        setIsEditing(true);
        const formValues = {
          title: initialValues.title,
          status: initialValues.status || 'not-started',
          content: initialValues.content || '',
          priority: initialValues.priority || 'medium',
          timeStart: initialValues.timeStart ? dayjs(initialValues.timeStart) : null,
          timeFinish: initialValues.timeFinish ? dayjs(initialValues.timeFinish) : null,
          listUser: initialValues.listUser ? initialValues.listUser.map(u => u._id || u) : [],
        };
        
        form.setFieldsValue(formValues);
        
        // Set thumbnail URL nếu có
        if (initialValues.thumbnail) {
          setThumbnailUrl(initialValues.thumbnail);
        }
      } else {
        setIsEditing(false);
        form.resetFields();
        setThumbnailFile(null);
        setThumbnailUrl('');
        
        // Set default values for new project
        const defaultValues = {
          status: 'not-started',
          priority: 'medium'
        };
        
        form.setFieldsValue(defaultValues);
      }
    }
  }, [visible, initialValues, form]);

  const handleFileChange = (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      if (info.file.response && info.file.response.url) {
        setThumbnailUrl(info.file.response.url);
      } else {
        const file = info.file.originFileObj;
        setThumbnailFile(file);
        setThumbnailUrl(URL.createObjectURL(file));
      }
      setUploading(false);
      message.success(`${info.file.name} upload thành công`);
    } else if (info.file.status === 'error') {
      setUploading(false);
      message.error(`${info.file.name} upload thất bại`);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được upload file ảnh (JPG, PNG, GIF)!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };

  const customUploadRequest = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      setThumbnailFile(file);
      setThumbnailUrl(URL.createObjectURL(file));
      onSuccess({}, file);
    } catch (error) {
      onError(error);
      message.error('Upload ảnh thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const handleFinish = (values) => {
    const formData = new FormData();
    
    // Thêm các field chính của dự án
    Object.keys(values).forEach(key => {
      if (values[key] !== undefined && values[key] !== null) {
        if (key === 'timeStart' || key === 'timeFinish') {
          formData.append(key, values[key].format('YYYY-MM-DD'));
        } else if (key === 'listUser' && Array.isArray(values[key])) {
          formData.append(key, JSON.stringify(values[key]));
        } else {
          formData.append(key, values[key]);
        }
      }
    });
    
    // QUAN TRỌNG: Người tạo dự án chính là người phụ trách
    if (currentUser?.id) {
      // Người tạo = Người phụ trách
      formData.append('assignee_id', currentUser.id);
      formData.append('createdBy', currentUser.id);
    }
    
    // Thêm thumbnail file nếu có
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    } else if (initialValues?.thumbnail && !thumbnailUrl.startsWith('blob:')) {
      // Nếu đang chỉnh sửa và có thumbnail cũ (không phải blob URL)
      formData.append('thumbnail', initialValues.thumbnail);
    }
    
    onFinish(formData);
  };

  // Validation cho timeFinish không được trước timeStart
  const validateDates = (_, value) => {
    const timeStart = form.getFieldValue('timeStart');
    
    if (timeStart && value) {
      if (value.isBefore(timeStart, 'day')) {
        return Promise.reject(new Error('Hạn hoàn thành không được trước ngày bắt đầu!'));
      }
    }
    return Promise.resolve();
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
    >
      

      {/* Tên dự án */}
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="title"
            label="Tên dự án"
            rules={[{ required: true, message: 'Vui lòng nhập tên dự án!' }]}
          >
            <Input 
              placeholder="Nhập tên dự án..." 
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Mô tả dự án */}
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="content"
            label="Mô tả dự án"
            rules={[
          { required: true, message: 'Vui lòng nhập mô tả dự án!' }
        ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả chi tiết về dự án..." 
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Trạng thái và Độ ưu tiên */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select 
              placeholder="Chọn trạng thái"
              size="large"
              suffixIcon={<ProjectOutlined />}
            >
              <Option value="not-started">
                <span style={{ color: '#fa8c16' }}>Chưa bắt đầu</span>
              </Option>
              <Option value="in-progress">
                <span style={{ color: '#1890ff' }}>Đang thực hiện</span>
              </Option>
              <Option value="on-hold">
                <span style={{ color: '#722ed1' }}>Tạm dừng</span>
              </Option>
              <Option value="completed">
                <span style={{ color: '#52c41a' }}>Hoàn thành</span>
              </Option>
              <Option value="cancelled">
                <span style={{ color: '#f5222d' }}>Đã hủy</span>
              </Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="priority"
            label="Độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên!' }]}
          >
            <Select 
              placeholder="Chọn độ ưu tiên"
              size="large"
            >
              <Option value="low">
                <span style={{ color: '#52c41a' }}>Thấp</span>
              </Option>
              <Option value="medium">
                <span style={{ color: '#faad14' }}>Trung bình</span>
              </Option>
              <Option value="high">
                <span style={{ color: '#f5222d' }}>Cao</span>
              </Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Hiển thị người phụ trách (chỉ khi chỉnh sửa) */}
      {isEditing && initialValues && (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Người phụ trách chính">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px',
                backgroundColor: '#e6f7ff',
                borderRadius: '6px',
                border: '1px solid #91d5ff'
              }}>
                <Avatar 
                  size="large" 
                  src={currentUser?.avatar} 
                  icon={<UserOutlined />}
                  style={{ 
                    marginRight: '12px', 
                    backgroundColor: '#1890ff',
                    border: '2px solid #1890ff'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {currentUser?.fullName || currentUser?.name}
                    <Tag color="blue" icon={<CrownOutlined />}>
                      Phụ trách chính
                    </Tag>
                    {initialValues.createdBy === currentUser?.id && (
                      <Tag color="green" icon={<CheckOutlined />}>
                        Người tạo
                      </Tag>
                    )}
                  </div>
                  <Text type="secondary">
                    {currentUser?.email}
                  </Text>
                </div>
                <Tag color="gold" style={{ fontSize: '12px', padding: '4px 8px' }}>
                  Không thể thay đổi
                </Tag>
              </div>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                Người tạo dự án sẽ luôn là người phụ trách chính
              </Text>
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* Thời gian */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="timeStart"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày bắt đầu"
              size="large"
              suffixIcon={<CalendarOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="timeFinish"
            label="Hạn hoàn thành"
            rules={[{ validator: validateDates }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn hạn hoàn thành"
              size="large"
              suffixIcon={<CalendarOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Upload ảnh thumbnail */}
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="Ảnh thumbnail">
            <div style={{ textAlign: 'center' }}>
              <Upload
                name="thumbnail"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleFileChange}
                customRequest={customUploadRequest}
                disabled={uploading || loading}
              >
                {thumbnailUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img 
                      src={thumbnailUrl} 
                      alt="Thumbnail" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '6px'
                      }} 
                    />
                    {uploading && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px'
                      }}>
                        <Spin />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    {uploading ? <LoadingOutlined /> : <UploadOutlined style={{ fontSize: '24px' }} />}
                    <div style={{ marginTop: 8 }}>Click để upload ảnh</div>
                  </div>
                )}
              </Upload>
              <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                Hỗ trợ: JPG, PNG, GIF • Tối đa: 5MB • Tỷ lệ khuyến nghị: 16:9
              </div>
            </div>
          </Form.Item>
        </Col>
      </Row>

      {/* Thành viên tham gia */}
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="listUser"
            label="Thành viên tham gia"
          >
            <Select
              mode="multiple"
              placeholder="Chọn thành viên tham gia dự án"
              optionFilterProp="children"
              showSearch
              allowClear
              size="large"
              maxTagCount={3}
              maxTagTextLength={15}
              suffixIcon={<TeamOutlined />}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {users
                .filter(u => currentUser && u._id !== currentUser.id) // Loại bỏ currentUser (vì đã là người phụ trách)
                .map(user => (
                  <Option key={user._id} value={user._id}>
                    <Space>
                      <Avatar 
                        size="small" 
                        src={user.avatar} 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: user.avatar ? 'transparent' : '#1890ff' }}
                      />
                      <span>{user.fullName}</span>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ({user.email})
                      </Text>
                    </Space>
                  </Option>
                ))}
            </Select>
            <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
              Nhấn để chọn thành viên, có thể chọn nhiều người. Người tạo dự án sẽ tự động là thành viên và phụ trách chính.
            </Text>
          </Form.Item>
        </Col>
      </Row>

      {/* Hiển thị thông tin người tạo
      {currentUser && (
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Thông tin người tạo">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px',
                backgroundColor: '#f6ffed',
                borderRadius: '6px',
                border: '1px solid #b7eb8f'
              }}>
                <Avatar 
                  size="large" 
                  src={currentUser.avatar} 
                  icon={<UserOutlined />}
                  style={{ 
                    marginRight: '12px', 
                    backgroundColor: '#52c41a',
                    border: '2px solid #73d13d'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {currentUser.fullName || currentUser.name}
                    <Tag color="green" icon={<CheckOutlined />}>
                      Bạn
                    </Tag>
                    <Tag color="blue" icon={<CrownOutlined />}>
                      Phụ trách chính
                    </Tag>
                  </div>
                  <Text type="secondary">
                    {currentUser.email}
                  </Text>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                    {isParentProject 
                      ? 'Bạn sẽ là người tạo và người phụ trách chính của dự án này' 
                      : 'Bạn sẽ là người tạo và người phụ trách của công việc này'}
                  </div>
                </div>
              </div>
            </Form.Item>
          </Col>
        </Row>
      )} */}

      {/* Buttons */}
      <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button 
            onClick={onCancel} 
            disabled={loading}
            size="large"
            style={{ minWidth: '120px' }}
          >
            Hủy bỏ
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            size="large"
            style={{ minWidth: '150px' }}
            icon={!isEditing && <PlusOutlined />}
          >
            {isEditing ? 'Cập nhật dự án' : 'Tạo dự án mới'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default ProjectForm;