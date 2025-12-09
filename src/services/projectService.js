// services/projectService.js
import { getApiClient, getAuthToken, API_CONFIG } from './api';

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
  UPLOAD: '/upload' // Thêm endpoint upload
};

// Thêm hàm upload file riêng
export const uploadFile = async (file) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    
    // Sử dụng API_CONFIG.BASE_URL thay vì hardcode
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

// Lấy danh sách dự án
export const getProjects = async (params = {}) => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.get(PROJECT_ENDPOINTS.LIST, { params });
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Lấy chi tiết dự án
export const getProjectDetail = async (id) => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.get(`${PROJECT_ENDPOINTS.DETAIL}/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching project detail:', error);
    throw error;
  }
};

// Tạo dự án mới (với upload ảnh)
export const createProject = async (formData) => {
  try {
    const token = getAuthToken();
    
    // Nếu là FormData (có file upload)
    if (formData instanceof FormData) {
      // Debug: Kiểm tra FormData
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
      }
      
      const apiClient = getApiClient();
      const baseURL = apiClient.defaults.baseURL;
      
      // Sử dụng fetch để upload file
      const response = await fetch(`${baseURL}${PROJECT_ENDPOINTS.CREATE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không set Content-Type, browser sẽ tự set boundary
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } else {
      // Nếu không có file, dùng axios bình thường
      const apiClient = getApiClient();
      const response = await apiClient.post(PROJECT_ENDPOINTS.CREATE, formData);
      return response;
    }
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Cập nhật dự án (với upload ảnh)
export const updateProject = async (id, formData) => {
  try {
    const token = getAuthToken();
    
    // Nếu là FormData (có file upload)
    if (formData instanceof FormData) {
      const apiClient = getApiClient();
      const baseURL = apiClient.defaults.baseURL;
      
      const response = await fetch(`${baseURL}${PROJECT_ENDPOINTS.EDIT}/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } else {
      // Nếu không có file
      const apiClient = getApiClient();
      const response = await apiClient.patch(`${PROJECT_ENDPOINTS.EDIT}/${id}`, formData);
      return response;
    }
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// Xóa dự án (xóa mềm)
export const deleteProject = async (id) => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.patch(`${PROJECT_ENDPOINTS.DELETE}/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Thay đổi trạng thái dự án
export const changeProjectStatus = async (id, status) => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.patch(`${PROJECT_ENDPOINTS.CHANGE_STATUS}/${id}`, { status });
    return response;
  } catch (error) {
    console.error('Error changing project status:', error);
    throw error;
  }
};

// Thay đổi độ ưu tiên dự án
export const changeProjectPriority = async (id, priority) => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.patch(`${PROJECT_ENDPOINTS.CHANGE_PRIORITY}/${id}`, { priority });
    return response;
  } catch (error) {
    console.error('Error changing project priority:', error);
    throw error;
  }
};

// Thay đổi nhiều dự án cùng lúc
export const changeMultipleProjects = async (ids, key, value) => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.patch(PROJECT_ENDPOINTS.CHANGE_MULTI, {
      ids,
      key,
      value
    });
    return response;
  } catch (error) {
    console.error('Error changing multiple projects:', error);
    throw error;
  }
};

// Thêm comment
export const addComment = async (projectId, comment) => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.post(`${PROJECT_ENDPOINTS.COMMENT.ADD}/${projectId}`, { comment });
    return response;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Sửa comment
export const editComment = async (commentId, comment) => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.patch(`${PROJECT_ENDPOINTS.COMMENT.EDIT}/${commentId}`, { comment });
    return response;
  } catch (error) {
    console.error('Error editing comment:', error);
    throw error;
  }
};

// Xóa comment
export const deleteComment = async (commentId) => {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.patch(`${PROJECT_ENDPOINTS.COMMENT.DELETE}/${commentId}`);
    return response;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Export tất cả functions
export default {
  getProjects,
  getProjectDetail,
  createProject,
  updateProject,
  deleteProject,
  changeProjectStatus,
  changeProjectPriority,
  changeMultipleProjects,
  addComment,
  editComment,
  deleteComment,
  uploadFile // Thêm uploadFile vào export
};