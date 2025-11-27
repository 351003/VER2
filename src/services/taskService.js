import axios from 'axios';

const API_BASE_URL = 'http://localhost:3370/api/v1';

// Tạo instance axios với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response lỗi
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data trực tiếp
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, chuyển hướng đến trang login
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Xử lý lỗi mạng
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
    }
    
    throw this.handleError(error);
  }
);

const taskService = {
  // Lấy danh sách tasks với phân trang và tìm kiếm
  async getTasks(params = {}) {
    try {
      const response = await apiClient.get('/tasks', { 
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          search: params.search,
          status: params.status,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder
        }
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Lấy chi tiết task
  async getTaskDetail(id) {
    try {
      const response = await apiClient.get(`/tasks/detail/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Tạo task mới
  async createTask(taskData) {
    try {
      const response = await apiClient.post('/tasks/create', taskData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Cập nhật task
  async updateTask(id, taskData) {
    try {
      const response = await apiClient.patch(`/tasks/edit/${id}`, taskData);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Thay đổi trạng thái task
  async changeTaskStatus(id, status) {
    try {
      const response = await apiClient.patch(`/tasks/change-status/${id}`, { status });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Xóa task (soft delete)
  async deleteTask(id) {
    try {
      const response = await apiClient.patch(`/tasks/delete/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Xử lý lỗi thống nhất
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Có lỗi xảy ra khi kết nối đến server');
  }
};

export default taskService;