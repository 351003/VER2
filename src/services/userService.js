import axios from 'axios';

const API_BASE_URL = 'http://localhost:3370/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error.response?.data || error;
  }
);

const userService = {
  // Lấy danh sách users (cho assignee)
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/users', { 
        params: {
          page: params.page || 1,
          limit: params.limit || 100,
          search: params.search
        }
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Lấy user by id
  async getUserById(id) {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error) {
    console.error('User API Error:', error);
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('Có lỗi xảy ra khi tải danh sách người dùng');
  }
};

export default userService;