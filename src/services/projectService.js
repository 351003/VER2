// services/projectService.js
import { apiClientV1, apiClientV3, API_CONFIG } from './api';

// Projects API endpoints
const PROJECT_ENDPOINTS = {
  LIST: '/projects',
  DETAIL: '/projects/detail',
  CREATE: '/projects/create',
  EDIT: '/projects/edit',
  CHANGE_STATUS: '/projects/change-status',
  CHANGE_PRIORITY: '/projects/priority',
  CHANGE_MULTI: '/projects/change-multi',
  DELETE: '/projects/delete',
  COMMENT: {
    ADD: '/projects/comment',
    EDIT: '/projects/comment/edit',
    DELETE: '/projects/comment/delete'
  },
  UPLOAD: '/upload'
};

// Helper để xác định API client dựa trên role của user - FIXED (case insensitive)
const getApiClientByRole = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return apiClientV1;
  
  try {
    const user = JSON.parse(userStr);
    const userRole = user.role?.toUpperCase(); // CHUYỂN THÀNH CHỮ HOA
    return userRole === 'MANAGER' ? apiClientV3 : apiClientV1;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return apiClientV1;
  }
};

// Helper để lấy API base URL dựa trên role - FIXED (case insensitive)
const getApiBaseUrlByRole = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return `${API_CONFIG.BASE_URL}/api/v1`;
  
  try {
    const user = JSON.parse(userStr);
    const userRole = user.role?.toUpperCase(); // CHUYỂN THÀNH CHỮ HOA
    return userRole === 'MANAGER' 
      ? `${API_CONFIG.BASE_URL}/api/v3` 
      : `${API_CONFIG.BASE_URL}/api/v1`;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return `${API_CONFIG.BASE_URL}/api/v1`;
  }
};

// ========== XỬ LÝ COMMENT ==========

// Thêm comment - Dùng POST /api/v1/projects/comment/:id
export const addComment = async (projectId, comment) => {
  try {
    const response = await apiClientV1.post(`${PROJECT_ENDPOINTS.COMMENT.ADD}/${projectId}`, { 
      comment 
    });
    
    return {
      success: response?.code === 200,
      message: response?.message || 'Thêm comment thành công',
      data: response?.data || response
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    
    let errorMessage = 'Thêm comment thất bại!';
    if (error.message.includes('401')) {
      errorMessage = 'Bạn cần đăng nhập để thêm comment!';
    }
    
    throw new Error(errorMessage);
  }
};

// Sửa comment - Dùng PATCH /api/v1/projects/comment/edit/:id
export const editComment = async (commentId, comment) => {
  try {
    const response = await apiClientV1.patch(
      `${PROJECT_ENDPOINTS.COMMENT.EDIT}/${commentId}`, 
      { comment }
    );
    
    return {
      success: response?.code === 200,
      message: response?.message || 'Sửa comment thành công',
      data: response?.data || response
    };
  } catch (error) {
    console.error('Error editing comment:', error);
    
    let errorMessage = 'Sửa comment thất bại!';
    if (error.message.includes('400') && error.message.includes('khong duoc sua')) {
      errorMessage = 'Bạn không được sửa comment của người khác!';
    }
    
    throw new Error(errorMessage);
  }
};

// Xóa comment - Dùng PATCH /api/v1/projects/comment/delete/:id (soft delete)
export const deleteComment = async (commentId) => {
  try {
    const response = await apiClientV1.patch(
      `${PROJECT_ENDPOINTS.COMMENT.DELETE}/${commentId}`
    );
    
    return {
      success: response?.code === 200,
      message: response?.message || 'Xóa comment thành công',
      data: response?.data || response
    };
  } catch (error) {
    console.error('Error deleting comment:', error);
    
    let errorMessage = 'Xóa comment thất bại!';
    if (error.message.includes('400') && error.message.includes('khong duoc xoa')) {
      errorMessage = 'Bạn không được xóa comment của người khác!';
    }
    
    throw new Error(errorMessage);
  }
};

// Helper để xác định API client cho project detail
const getDetailApiClient = () => {
  return apiClientV1;
};

// Thêm hàm upload file riêng
export const uploadFile = async (file) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1${PROJECT_ENDPOINTS.UPLOAD}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Lấy danh sách dự án - Backend đã tự lọc theo user
export const getProjects = async (params = {}) => {
  try {
    const apiClient = getApiClientByRole();
    const response = await apiClient.get(PROJECT_ENDPOINTS.LIST, { params });
    
    return {
      success: true,
      data: response || [],
      pagination: {
        page: params.page || 1,
        pageSize: params.limit || 10,
        total: response?.length || 0
      }
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Lấy chi tiết dự án
export const getProjectDetail = async (id) => {
  try {
    const apiClient = getDetailApiClient();
    const response = await apiClient.get(`${PROJECT_ENDPOINTS.DETAIL}/${id}`);
    
    return {
      success: response?.code === 200 || response?.success === true,
      data: response?.data || response,
      comments: response?.comment || []
    };
  } catch (error) {
    console.error('Error fetching project detail:', error);
    throw error;
  }
};

// Tạo dự án mới - FIXED VERSION (case insensitive)
export const createProject = async (formData) => {
  try {
    console.log('=== DEBUG CREATE PROJECT ===');
    
    const isFormData = formData instanceof FormData;
    console.log('Is FormData:', isFormData);
    
    // Xác định xem dùng route nào
    const userStr = localStorage.getItem('user');
    console.log('User from localStorage:', userStr);
    
    let apiBaseUrl;
    let apiClient;
    
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('User role:', user.role);
      
      // CHUYỂN ROLE THÀNH CHỮ HOA ĐỂ SO SÁNH
      const userRole = user.role?.toUpperCase();
      console.log('User role uppercase:', userRole);
      
      // Manager tạo dự án cha dùng V3
      // User tạo sub-project dùng V1
      if (userRole === 'MANAGER') {
        apiBaseUrl = `${API_CONFIG.BASE_URL}/api/v3`;
        apiClient = apiClientV3;
        console.log('✓ MANAGER detected, using API v3');
      } else {
        apiBaseUrl = `${API_CONFIG.BASE_URL}/api/v1`;
        apiClient = apiClientV1;
        console.log('✓ USER detected, using API v1');
      }
    } else {
      apiBaseUrl = `${API_CONFIG.BASE_URL}/api/v1`;
      apiClient = apiClientV1;
      console.log('⚠ No user found, using default API v1');
    }
    
    console.log('API Base URL:', apiBaseUrl);
    console.log('API Client:', apiClient === apiClientV3 ? 'V3' : 'V1');
    
    let response;
    
    if (isFormData) {
      // Xử lý FormData (Manager tạo dự án với upload file)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      // DÙNG apiBaseUrl TRỰC TIẾP
      const apiUrl = `${apiBaseUrl}${PROJECT_ENDPOINTS.CREATE}`;
      console.log('Final API URL:', apiUrl);
      
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      response = await response.json();
      console.log('Fetch response JSON:', response);
    } else {
      // Xử lý JSON data (User tạo sub-project) - dùng axios client
      console.log('JSON data:', formData);
      response = await apiClient.post(PROJECT_ENDPOINTS.CREATE, formData);
      console.log('Axios response:', response);
    }
    
    console.log('=== CREATE PROJECT SUCCESS ===');
    return {
      success: response?.code === 200 || response?.success === true,
      message: response?.message || 'Thành công',
      data: response?.data || response
    };
  } catch (error) {
    console.error('=== ERROR IN CREATE PROJECT ===');
    console.error('Error creating project:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Tạo dự án thất bại!';
    if (error.message.includes('401')) {
      errorMessage = 'Bạn cần đăng nhập để tạo dự án!';
    } else if (error.message.includes('403')) {
      errorMessage = 'Bạn không có quyền tạo dự án!';
    } else if (error.message.includes('404')) {
      errorMessage = 'API không tồn tại hoặc không tìm thấy!';
    }
    
    throw new Error(`${errorMessage} Chi tiết: ${error.message}`);
  }
};

// Cập nhật dự án - FIXED VERSION (case insensitive)
export const updateProject = async (id, formData) => {
  try {
    console.log('=== DEBUG UPDATE PROJECT ===');
    console.log('Updating project ID:', id);
    
    const isFormData = formData instanceof FormData;
    console.log('Is FormData:', isFormData);
    
    // Xác định xem dùng route nào
    const userStr = localStorage.getItem('user');
    let apiBaseUrl;
    let apiClient;
    
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('User role:', user.role);
      
      // CHUYỂN ROLE THÀNH CHỮ HOA ĐỂ SO SÁNH
      const userRole = user.role?.toUpperCase();
      console.log('User role uppercase:', userRole);
      
      if (userRole === 'MANAGER') {
        apiBaseUrl = `${API_CONFIG.BASE_URL}/api/v3`;
        apiClient = apiClientV3;
        console.log('✓ MANAGER detected, using API v3');
      } else {
        apiBaseUrl = `${API_CONFIG.BASE_URL}/api/v1`;
        apiClient = apiClientV1;
        console.log('✓ USER detected, using API v1');
      }
    } else {
      apiBaseUrl = `${API_CONFIG.BASE_URL}/api/v1`;
      apiClient = apiClientV1;
      console.log('⚠ No user found, using default API v1');
    }
    
    console.log('API Base URL:', apiBaseUrl);
    
    let response;
    
    if (isFormData) {
      // Xử lý FormData
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = `${apiBaseUrl}${PROJECT_ENDPOINTS.EDIT}/${id}`;
      
      console.log('PATCH URL:', url);
      
      response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      response = await response.json();
    } else {
      // Xử lý JSON data
      console.log('JSON update data:', formData);
      response = await apiClient.patch(`${PROJECT_ENDPOINTS.EDIT}/${id}`, formData);
      console.log('Axios response:', response);
    }
    
    console.log('=== UPDATE PROJECT SUCCESS ===');
    return {
      success: response?.code === 200 || response?.success === true,
      message: response?.message || 'Cập nhật thành công',
      data: response?.data || response
    };
  } catch (error) {
    console.error('=== ERROR IN UPDATE PROJECT ===');
    console.error('Error updating project:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// Xóa dự án
export const deleteProject = async (id) => {
  try {
    const apiClient = getApiClientByRole();
    const response = await apiClient.patch(`${PROJECT_ENDPOINTS.DELETE}/${id}`);
    
    return {
      success: response?.code === 200 || response?.success === true,
      message: response?.message || 'Xóa thành công'
    };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Thay đổi trạng thái dự án
export const changeProjectStatus = async (id, status) => {
  try {
    const apiClient = getApiClientByRole();
    const response = await apiClient.patch(`${PROJECT_ENDPOINTS.CHANGE_STATUS}/${id}`, { status });
    
    return {
      success: response?.code === 200 || response?.success === true,
      message: response?.message || 'Cập nhật trạng thái thành công'
    };
  } catch (error) {
    console.error('Error changing project status:', error);
    throw error;
  }
};

// Thay đổi độ ưu tiên dự án
export const changeProjectPriority = async (id, priority) => {
  try {
    const apiClient = getApiClientByRole();
    const response = await apiClient.patch(`${PROJECT_ENDPOINTS.CHANGE_PRIORITY}/${id}`, { priority });
    
    return {
      success: response?.code === 200 || response?.success === true,
      message: response?.message || 'Cập nhật độ ưu tiên thành công'
    };
  } catch (error) {
    console.error('Error changing project priority:', error);
    throw error;
  }
};

// Thay đổi nhiều dự án cùng lúc
export const changeMultipleProjects = async (ids, key, value) => {
  try {
    const apiClient = getApiClientByRole();
    const response = await apiClient.patch(PROJECT_ENDPOINTS.CHANGE_MULTI, {
      ids,
      key,
      value
    });
    
    return {
      success: response?.code === 200 || response?.success === true,
      message: response?.message || 'Cập nhật hàng loạt thành công'
    };
  } catch (error) {
    console.error('Error changing multiple projects:', error);
    throw error;
  }
};

// Lấy sub-projects (dự án con)
export const getSubProjects = async (parentId, params = {}) => {
  try {
    const response = await apiClientV1.get(PROJECT_ENDPOINTS.LIST, {
      params: {
        ...params,
        parentId
      }
    });
    
    return {
      success: true,
      data: response || []
    };
  } catch (error) {
    console.error('Error fetching sub-projects:', error);
    throw error;
  }
};

// Export tất cả functions
export default {
  getProjects,
  getProjectDetail,
  getSubProjects,
  createProject,
  updateProject,
  deleteProject,
  changeProjectStatus,
  changeProjectPriority,
  changeMultipleProjects,
  addComment,
  editComment,
  deleteComment,
  uploadFile
};