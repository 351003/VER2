import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Avatar, List, Space, Typography, Divider, Tooltip } from 'antd';
import { SendOutlined, UserOutlined, PaperClipOutlined, SmileOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const TeamChat = ({ team, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Mock messages data
  const mockMessages = [
    {
      id: 1,
      content: 'Chào mọi người! Dự án mới đã bắt đầu rồi.',
      sender: { id: 1, name: 'Nguyễn Văn A', avatar: null },
      timestamp: '2024-01-15T09:30:00',
      type: 'text'
    },
    {
      id: 2,
      content: 'Tôi đã hoàn thành wireframe cho trang chủ, mọi người check nhé!',
      sender: { id: 3, name: 'Lê Văn C', avatar: null },
      timestamp: '2024-01-15T10:15:00',
      type: 'text'
    },
    {
      id: 3,
      content: 'API documentation đã được cập nhật, mọi người có thể xem tại đây: [link]',
      sender: { id: 2, name: 'Trần Thị B', avatar: null },
      timestamp: '2024-01-15T11:00:00',
      type: 'text'
    }
  ];

  useEffect(() => {
    setMessages(mockMessages);
  }, [team]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message = {
      id: messages.length + 1,
      content: newMessage,
      sender: currentUser,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card
      title={
        <Space>
          <Avatar size="small" src={team.avatar} icon={<UserOutlined />} />
          <span>{team.name} - Team Chat</span>
        </Space>
      }
      extra={
        <Button type="text" onClick={onClose}>
          Đóng
        </Button>
      }
      style={{ height: '600px', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}
    >
      {/* Messages List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <List
          dataSource={messages}
          renderItem={(message) => (
            <List.Item style={{ border: 'none', padding: '8px 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                flexDirection: message.sender.id === currentUser.id ? 'row-reverse' : 'row',
                width: '100%'
              }}>
                <Avatar 
                  size="small" 
                  src={message.sender.avatar} 
                  icon={<UserOutlined />}
                  style={{ margin: message.sender.id === currentUser.id ? '0 0 0 8px' : '0 8px 0 0' }}
                />
                <div style={{ 
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender.id === currentUser.id ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{ 
                    background: message.sender.id === currentUser.id ? '#1890ff' : '#f0f0f0',
                    color: message.sender.id === currentUser.id ? 'white' : 'black',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    wordWrap: 'break-word'
                  }}>
                    {message.content}
                  </div>
                  <Text type="secondary" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {message.sender.name} • {formatTime(message.timestamp)}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Message Input */}
      <div style={{ padding: '16px' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ resize: 'none' }}
          />
          <Tooltip title="Gửi tin nhắn">
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            />
          </Tooltip>
        </Space.Compact>
        
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <Space size="small">
            <Button type="text" icon={<PaperClipOutlined />} size="small">
              Đính kèm
            </Button>
            <Button type="text" icon={<SmileOutlined />} size="small">
              Emoji
            </Button>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Enter để gửi, Shift + Enter để xuống dòng
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default TeamChat;