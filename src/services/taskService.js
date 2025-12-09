
// import { apiClientV1 } from './api';
// const taskService = {
//   // Lấy danh sách tasks với phân trang và tìm kiếm
//   async getTasks(params = {}) {
//     try {
//       const response = await apiClientV1.get('/tasks', { 
//         params: {
//           page: params.page || 1,
//           limit: params.limit || 50,
//           search: params.search,
//           status: params.status,
//           sortBy: params.sortBy,
//           sortOrder: params.sortOrder
//         }
//       });
//       return response;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   },

//   // Lấy chi tiết task
//   async getTaskDetail(id) {
//     try {
//       const response = await apiClientV1.get(`/tasks/detail/${id}`);
//       return response;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   },

//   // Tạo task mới
//   async createTask(taskData) {
//     try {
//       const response = await apiClientV1.post('/tasks/create', taskData);
//       return response;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   },

//   // Cập nhật task
//   async updateTask(id, taskData) {
//     try {
//       const response = await apiClientV1.patch(`/tasks/edit/${id}`, taskData);
//       return response;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   },

//   // Thay đổi trạng thái task
//   async changeTaskStatus(id, status) {
//     try {
//       const response = await apiClientV1.patch(`/tasks/change-status/${id}`, { status });
//       return response;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   },

//   // Xóa task (soft delete)
//   async deleteTask(id) {
//     try {
//       const response = await apiClientV1.patch(`/tasks/delete/${id}`);
//       return response;
//     } catch (error) {
//       throw this.handleError(error);
//     }
//   }

//   // // Xử lý lỗi thống nhất
//   // handleError(error) {
//   //   console.error('API Error:', error);
    
//   //   if (error.response?.data?.message) {
//   //     return new Error(error.response.data.message);
//   //   }
    
//   //   if (error.message) {
//   //     return new Error(error.message);
//   //   }
    
//   //   return new Error('Có lỗi xảy ra khi kết nối đến server');
//   // }
// };

// export default taskService;
// services/taskService.js - Cập nhật để dùng apiClientV1 từ api.js
import { apiClientV1, API_CONFIG } from './api';

const taskService = {
  // Lấy danh sách tasks với phân trang và tìm kiếm
  async getTasks(params = {}) {
    try {
      console.log('taskService.getTasks called with params:', params);
      const response = await apiClientV1.get(API_CONFIG.ENDPOINTS.TASKS.LIST, { 
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          keyword: params.keyword || params.search, // Support both keyword and search
          status: params.status,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder
        }
      });
      
      console.log('getTasks response:', response);
      
      // Backend trả về array tasks trực tiếp hoặc format {code, data}
      // Nếu là array thì return luôn, nếu có code field thì check
      if (response.code && response.code !== 200) {
        throw new Error(response.message || 'Lỗi lấy danh sách công việc');
      }
      
      return response;
    } catch (error) {
      console.error('getTasks error:', error);
      console.log('Response data:', error.response?.data);
      throw error;
    }
  },

  // Lấy chi tiết task
  async getTaskDetail(id) {
    try {
      const response = await apiClientV1.get(`${API_CONFIG.ENDPOINTS.TASKS.DETAIL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Tạo task mới
  async createTask(taskData) {
    try {
      const response = await apiClientV1.post(API_CONFIG.ENDPOINTS.TASKS.CREATE, taskData);
      
      // Check code từ backend response
      if (response.code && response.code !== 200) {
        throw new Error(response.message || 'Lỗi tạo công việc');
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật task
  async updateTask(id, taskData) {
    try {
      const response = await apiClientV1.patch(`${API_CONFIG.ENDPOINTS.TASKS.EDIT}/${id}`, taskData);
      
      if (response.code && response.code !== 200) {
        throw new Error(response.message || 'Lỗi cập nhật công việc');
      }
      
      return response;
    } catch (error) {
      console.error('updateTask error:', error);
      console.log('Response data:', error.response?.data);
      throw error;
    }
  },

  // Thay đổi trạng thái task
  async changeTaskStatus(id, status) {
    try {
      console.log("changeTaskStatus called with:", { id, status });
      const response = await apiClientV1.patch(`${API_CONFIG.ENDPOINTS.TASKS.CHANGE_STATUS}/${id}`, { status });
      console.log("changeTaskStatus response:", response);
      
      if (response.code && response.code !== 200) {
        throw new Error(response.message || 'Lỗi thay đổi trạng thái');
      }
      
      return response;
    } catch (error) {
      console.error('changeTaskStatus error:', error);
      console.log('Response data:', error.response?.data);
      throw error;
    }
  },

  // Xóa task (soft delete)
  async deleteTask(id) {
    try {
      console.log('taskService.deleteTask called with id:', id);
      const url = `${API_CONFIG.ENDPOINTS.TASKS.DELETE}/${id}`;
      console.log('deleteTask URL:', url);
      const response = await apiClientV1.patch(url);
      console.log('deleteTask response:', response);
      
      if (response.code && response.code !== 200) {
        throw new Error(response.message || 'Lỗi xóa công việc');
      }
      
      return response;
    } catch (error) {
      console.error('deleteTask error:', error);
      throw error;
    }
  }
};

export default taskService;