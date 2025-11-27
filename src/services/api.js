// Cấu hình API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3370/api/v1',
  TIMEOUT: 10000,
  ENDPOINTS: {
    TASKS: {
      LIST: '/tasks',
      DETAIL: '/tasks/detail',
      CREATE: '/tasks/create',
      EDIT: '/tasks/edit',
      CHANGE_STATUS: '/tasks/change-status',
      DELETE: '/tasks/delete'
    }
  }
};

// Helper để lấy token
export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper để lấy headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};