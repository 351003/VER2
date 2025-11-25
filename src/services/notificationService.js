// src/services/notificationService.js
import api from './api';

// REAL SERVICE
export const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

// MOCK SERVICE
// export const mockNotificationService = {
//   getNotifications: async (params = {}) => {
//     await new Promise(resolve => setTimeout(resolve, 600));
    
//     const mockNotifications = [
//       {
//         _id: "1",
//         title: "Công việc mới",
//         message: "Bạn được giao task 'Thiết kế database schema'",
//         type: "task",
//         read: false,
//         data: { taskId: "1" },
//         link: "/tasks/1",
//         createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
//       },
//       {
//         _id: "2",
//         title: "Deadline sắp đến",
//         message: "Task 'Implement authentication API' hết hạn trong 2 ngày",
//         type: "deadline",
//         read: false,
//         data: { taskId: "2" },
//         link: "/tasks/2",
//         createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
//       },
//       {
//         _id: "3",
//         title: "Thêm vào dự án",
//         message: "Bạn được thêm vào dự án 'Website Redesign'",
//         type: "project",
//         read: true,
//         data: { projectId: "1" },
//         link: "/projects/1",
//         createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
//       }
//     ];

//     let filteredNotifications = mockNotifications;
//     if (params.unreadOnly === 'true') {
//       filteredNotifications = filteredNotifications.filter(noti => !noti.read);
//     }

//     return {
//       notifications: filteredNotifications,
//       pagination: {
//         page: 1,
//         limit: 20,
//         total: filteredNotifications.length,
//         pages: 1
//       },
//       unreadCount: filteredNotifications.filter(noti => !noti.read).length
//     };
//   },

//   markAsRead: async (notificationId) => {
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     return {
//       message: "Notification marked as read",
//       notification: {
//         _id: notificationId,
//         read: true
//       }
//     };
//   },

//   markAllAsRead: async () => {
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     return {
//       message: "All notifications marked as read"
//     };
//   },

//   deleteNotification: async (notificationId) => {
//     await new Promise(resolve => setTimeout(resolve, 300));
    
//     return {
//       message: "Notification deleted successfully"
//     };
//   }
// };