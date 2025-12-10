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

// Helper để xác định API client dựa trên role của user
const getApiClientByRole = () => {
  // Lấy thông tin user từ localStorage
  const userStr = localStorage.getItem('user');
  if (!userStr) return apiClientV1; // Mặc định dùng V1
  
  try {
    const user = JSON.parse(userStr);
    // Nếu là MANAGER, dùng V3, ngược lại dùng V1
    return user.role === 'MANAGER' ? apiClientV3 : apiClientV1;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return apiClientV1;
  }
};
// ========== XỬ LÝ COMMENT ==========

// Thêm comment - Dùng POST /api/v1/projects/comment/:id
export const addComment = async (projectId, comment) => {
  try {
    // Comment luôn dùng API V1 (User route)
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
    
    // Tạo error message phù hợp
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
    // Comment luôn dùng API V1
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
    // Comment luôn dùng API V1
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

// Helper để xác định API client cho project detail (cả 2 route đều giống)
const getDetailApiClient = () => {
  return apiClientV1; // Dùng V1 vì cả 2 đều giống
};

// Thêm hàm upload file riêng
export const uploadFile = async (file) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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

// Lấy danh sách dự án - Backend đã tự lọc theo user
export const getProjects = async (params = {}) => {
  try {
    const apiClient = getApiClientByRole();
    const response = await apiClient.get(PROJECT_ENDPOINTS.LIST, { params });
    
    // Format response để phù hợp với frontend
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

// Tạo dự án mới
export const createProject = async (formData) => {
  try {
    const isFormData = formData instanceof FormData;
    
    // Xác định xem dùng route nào
    const userStr = localStorage.getItem('user');
    let apiClient;
    
    if (userStr) {
      const user = JSON.parse(userStr);
      // Manager tạo dự án cha dùng V3 (có upload file)
      // User tạo sub-project dùng V1 (không upload file)
      apiClient = user.role === 'MANAGER' ? apiClientV3 : apiClientV1;
    } else {
      apiClient = apiClientV1; // Mặc định
    }
    
    let response;
    
    if (isFormData) {
      // Xử lý FormData (Manager tạo dự án với upload file)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = `${apiClient.defaults.baseURL}${PROJECT_ENDPOINTS.CREATE}`;
      
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      response = await response.json();
    } else {
      // Xử lý JSON data (User tạo sub-project)
      response = await apiClient.post(PROJECT_ENDPOINTS.CREATE, formData);
    }
    
    return {
      success: response?.code === 200 || response?.success === true,
      message: response?.message || 'Thành công',
      data: response?.data || response
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Cập nhật dự án
export const updateProject = async (id, formData) => {
  try {
    const isFormData = formData instanceof FormData;
    
    // Xác định xem dùng route nào
    const userStr = localStorage.getItem('user');
    let apiClient;
    
    if (userStr) {
      const user = JSON.parse(userStr);
      // Manager dùng V3 (có upload file)
      // User dùng V1 (không upload file)
      apiClient = user.role === 'MANAGER' ? apiClientV3 : apiClientV1;
    } else {
      apiClient = apiClientV1;
    }
    
    let response;
    
    if (isFormData) {
      // Xử lý FormData
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = `${apiClient.defaults.baseURL}${PROJECT_ENDPOINTS.EDIT}/${id}`;
      
      response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      response = await response.json();
    } else {
      // Xử lý JSON data
      response = await apiClient.patch(`${PROJECT_ENDPOINTS.EDIT}/${id}`, formData);
    }
    
    return {
      success: response?.code === 200 || response?.success === true,
      message: response?.message || 'Cập nhật thành công',
      data: response?.data || response
    };
  } catch (error) {
    console.error('Error updating project:', error);
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
    // Sub-project luôn dùng API V1 (User route)
    const response = await apiClientV1.get(PROJECT_ENDPOINTS.LIST, {
      params: {
        ...params,
        parentId // Thêm parentId để filter
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