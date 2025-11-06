// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { notification as antdNotification } from 'antd';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Mock data cho notifications
const mockNotifications = [
  {
    _id: '1',
    title: 'Công việc mới được giao',
    message: 'Bạn được giao task "Thiết kế database cho hệ thống"',
    type: 'task',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    link: '/tasks/1'
  },
  {
    _id: '2',
    title: 'Deadline sắp đến',
    message: 'Task "Review code API" hết hạn trong 2 giờ',
    type: 'deadline',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    link: '/tasks/2'
  },
  {
    _id: '3',
    title: 'Lời mời tham gia nhóm',
    message: 'Bạn được Admin mời tham gia nhóm "Development Team"',
    type: 'team',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    link: '/teams'
  }
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  // Tính unread count
  useEffect(() => {
    const unread = notifications.filter(noti => !noti.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Giả lập real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        const newNotification = generateRandomNotification();
        handleNewNotification(newNotification);
      }

      if (Math.random() < 0.05) {
        showRandomDeadlineAlert();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const generateRandomNotification = () => {
    const types = ['task', 'deadline', 'project', 'system', 'meeting', 'team', 'mention'];
    const messages = {
      task: [
        'Bạn được giao task mới: "Thiết kế giao diện người dùng"',
        'Có task mới cần review: "API Authentication"',
        'Task "Database Optimization" đã được cập nhật'
      ],
      deadline: [
        'Task "Frontend Development" hết hạn trong 3 giờ',
        'Deadline "Project Documentation" sắp đến',
        'Công việc "Testing" cần hoàn thành trước 17:00'
      ],
      project: [
        'Dự án mới "Mobile App" đã được tạo',
        'Project "Web Platform" có 5 task chưa hoàn thành',
        'Thành viên mới đã tham gia dự án'
      ],
      system: [
        'Hệ thống sẽ nâng cấp vào cuối tuần',
        'Bảo trì định kỳ: 02:00 - 04:00 AM',
        'Cập nhật phiên bản mới có sẵn'
      ],
      meeting: [
        'Cuộc họp sprint planning sau 1 giờ',
        'Daily meeting bắt đầu sau 10 phút',
        'Review meeting lúc 14:00 chiều nay'
      ],
      team: [
        'Bạn được mời tham gia nhóm "Frontend Development"',
        'Bạn đã được thêm vào nhóm "Backend Team"',
        'Nhóm "Design Team" có thành viên mới tham gia'
      ],
      mention: [
        'Admin đã nhắc đến bạn trong một bình luận',
        'Manager đã đề cập đến bạn trong task review',
        'Bạn được nhắc đến trong cuộc thảo luận về dự án'
      ]
    };

    const type = types[Math.floor(Math.random() * types.length)];
    const messageList = messages[type];
    const message = messageList ? messageList[Math.floor(Math.random() * messageList.length)] : 'Thông báo mới';

    return {
      _id: Date.now().toString(),
      title: getNotificationTitle(type),
      message: message,
      type: type,
      read: false,
      createdAt: new Date(),
      link: `/${type}s/1`
    };
  };

  const getNotificationTitle = (type) => {
    const titles = {
      task: 'Công việc mới',
      deadline: 'Cảnh báo deadline',
      project: 'Cập nhật dự án',
      system: 'Thông báo hệ thống',
      meeting: 'Nhắc nhở họp',
      team: 'Lời mời tham gia nhóm',
      mention: 'Bạn được nhắc đến'
    };
    return titles[type] || 'Thông báo';
  };

  // SỬA LỖI: Đảm bảo luôn sử dụng antdNotification
  const handleNewNotification = (newNotification) => {
    setNotifications(prev => [newNotification, ...prev]);
    
    // Sử dụng antdNotification thay vì notification
    showNotificationToast(newNotification);
    
    // Gửi push notification nếu browser hỗ trợ
    if ('Notification' in window && Notification.permission === 'granted') {
      showPushNotification(newNotification);
    }
  };

  // SỬA LỖI: Sử dụng antdNotification thay vì notification
  const showNotificationToast = (notificationItem) => {
    const config = {
      message: notificationItem.title,
      description: notificationItem.message,
      duration: 4,
      placement: 'topRight'
    };

    // Sử dụng antdNotification thay vì notification
    switch (notificationItem.type) {
      case 'deadline':
        antdNotification.warning(config);
        break;
      case 'task':
        antdNotification.info(config);
        break;
      case 'meeting':
        antdNotification.success(config);
        break;
      case 'system':
        antdNotification.info(config);
        break;
      case 'team':
        antdNotification.success(config);
        break;
      case 'mention':
        antdNotification.info(config);
        break;
      default:
        antdNotification.success(config);
    }
  };

  // SỬA LỖI: Sử dụng antdNotification thay vì notification
  const showRandomDeadlineAlert = () => {
    const tasks = [
      'Thiết kế UI/UX',
      'Phát triển API',
      'Viết documentation',
      'Testing',
      'Deployment'
    ];
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    const times = ['30 phút', '1 giờ', '2 giờ', '3 giờ'];
    const time = times[Math.floor(Math.random() * times.length)];

    antdNotification.warning({
      message: '⏰ Cảnh báo Deadline',
      description: `Task "${task}" hết hạn trong ${time}`,
      duration: 6,
      placement: 'topRight'
    });
  };

  const showPushNotification = (notificationItem) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationItem.title, {
        body: notificationItem.message,
        icon: '/vite.svg',
        tag: notificationItem.type
      });
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications(prev =>
      prev.map(noti =>
        noti._id === notificationId ? { ...noti, read: true } : noti
      )
    );
    
    antdNotification.success({
      message: 'Đã đánh dấu là đã đọc',
      duration: 2
    });
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(noti => ({ ...noti, read: true }))
    );
    
    antdNotification.success({
      message: 'Đã đánh dấu tất cả là đã đọc',
      duration: 2
    });
  };

  const deleteNotification = async (notificationId) => {
    setNotifications(prev => prev.filter(noti => noti._id !== notificationId));
    
    antdNotification.success({
      message: 'Đã xóa thông báo',
      duration: 2
    });
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      antdNotification.warning({
        message: 'Trình duyệt không hỗ trợ Push Notifications'
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      antdNotification.warning({
        message: 'Bạn đã từ chối quyền thông báo. Vui lòng cấp quyền trong cài đặt trình duyệt.'
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      antdNotification.success({
        message: 'Push Notifications đã được kích hoạt!'
      });
      return true;
    }
    
    return false;
  };

  // Giả lập gửi email reminder
  const sendEmailReminder = async (taskData) => {
    antdNotification.info({
      message: '📧 Email Reminder Sent',
      description: `Email nhắc nhở đã được gửi cho task "${taskData.title}"`,
      duration: 3
    });
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Giả lập test notification
  const testNotification = async (type = 'task') => {
    const testNoti = generateRandomNotification();
    testNoti.type = type;
    handleNewNotification(testNoti);
  };

  // Thêm các hàm thông báo mới
  const notifyTeamInvitation = async (teamName, invitedBy) => {
    const teamNotification = {
      _id: `team-${Date.now()}`,
      title: 'Lời mời tham gia nhóm',
      message: `Bạn được ${invitedBy} mời tham gia nhóm "${teamName}"`,
      type: 'team',
      read: false,
      createdAt: new Date(),
      link: '/teams'
    };
    handleNewNotification(teamNotification);
  };

  const notifyProjectAssignment = async (projectName, assignedBy) => {
    const projectNotification = {
      _id: `project-${Date.now()}`,
      title: 'Được thêm vào dự án',
      message: `Bạn được ${assignedBy} thêm vào dự án "${projectName}"`,
      type: 'project',
      read: false,
      createdAt: new Date(),
      link: '/projects'
    };
    handleNewNotification(projectNotification);
  };

  const notifyTaskAssignment = async (taskTitle, assignedBy) => {
    const taskNotification = {
      _id: `task-${Date.now()}`,
      title: 'Công việc mới',
      message: `Bạn được ${assignedBy} giao task "${taskTitle}"`,
      type: 'task',
      read: false,
      createdAt: new Date(),
      link: '/tasks'
    };
    handleNewNotification(taskNotification);
  };

  const notifyMention = async (mentionedBy, context, link) => {
    const mentionNotification = {
      _id: `mention-${Date.now()}`,
      title: 'Bạn được nhắc đến',
      message: `${mentionedBy} đã nhắc đến bạn trong ${context}`,
      type: 'mention',
      read: false,
      createdAt: new Date(),
      link: link
    };
    handleNewNotification(mentionNotification);
  };

  const value = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPushPermission,
    sendEmailReminder,
    testNotification,
    notifyTeamInvitation,
    notifyProjectAssignment,
    notifyTaskAssignment,
    notifyMention
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};