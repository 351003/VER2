// services/api.js
import axios from 'axios';

// Cấu hình API cho cả auth và tasks
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3370',
  TIMEOUT: 10000,
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      // User API v1
      USER_REGISTER: '/api/v1/users/register',
      USER_LOGIN: '/api/v1/users/login',
      USER_LOGOUT: '/api/v1/users/logout',
      USER_FORGOT_PASSWORD: '/api/v1/users/password/forgot',
      USER_VERIFY_OTP: '/api/v1/users/password/otp',
      USER_RESET_PASSWORD: '/api/v1/users/password/reset',
      
      // Manager API v3
      MANAGER_LOGIN: '/api/v3/users/login',
      MANAGER_LOGOUT: '/api/v3/users/get', 
      
      // Admin API v2
      ADMIN_LOGIN: '/api/v2/users/login',
    },
    
    
    // Task endpoints (không cần /api/v1 prefix vì apiClientV1 đã có baseURL)
    TASKS: {
      LIST: '/tasks',
      DETAIL: '/tasks/detail',
      CREATE: '/tasks/create',
      EDIT: '/tasks/edit',
      CHANGE_STATUS: '/tasks/change-status',
      DELETE: '/tasks/delete'
    },
    
    // Project endpoints (không cần /api/v1 prefix vì apiClientV1 đã có baseURL)
    PROJECTS: {
      LIST: '/projects',
      DETAIL: '/projects/detail',
      CREATE: '/projects/create',
      EDIT: '/projects/edit',
      CHANGE_STATUS: '/projects/change-status',
      DELETE: '/projects/delete'
    },
    CALENDAR: {
      LIST: '/calendars',
      DETAIL: '/calendars/detail/:id',
      CREATE: '/calendars/create',
      EDIT: '/calendars/edit/:id',
      DELETE: '/calendars/delete/:id'
    }
  }
};

// Tạo axios instance chung
const createApiClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor để thêm token
  instance.interceptors.request.use(
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

  // Response interceptor xử lý lỗi
  instance.interceptors.response.use(
    (response) => response.data, // Trả về data trực tiếp
    (error) => {
      // Xử lý lỗi 401 (unauthorized)
      if (error.response?.status === 401) {
        // Xóa token và chuyển hướng đến login
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('apiVersion');
        
        // Chỉ redirect nếu không phải trang auth
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && 
            !currentPath.includes('/register') &&
            !currentPath.includes('/forgot-password')) {
          window.location.href = '/login';
        }
      }
      
      // Xử lý lỗi mạng
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
      }
      
      // Ném lỗi để component có thể xử lý
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Có lỗi xảy ra khi kết nối đến server';
      throw new Error(errorMessage);
    }
  );

  return instance;
};

// Tạo các api client cho các version khác nhau
export const apiClientV1 = createApiClient(`${API_CONFIG.BASE_URL}/api/v1`);
export const apiClientV2 = createApiClient(`${API_CONFIG.BASE_URL}/api/v2`);
export const apiClientV3 = createApiClient(`${API_CONFIG.BASE_URL}/api/v3`);

// Helper để lấy token
export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper để lấy headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper để lấy api client theo version
export const getApiClient = (version = 'v1') => {
  switch(version) {
    case 'v2':
      return apiClientV2;
    case 'v3':
      return apiClientV3;
    default:
      return apiClientV1;
  }
};