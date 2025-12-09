// // services/authService.js
// import { apiClientV1, apiClientV3, API_CONFIG } from './api';

// // Helper để kiểm tra backend có chạy không
// const checkBackend = async () => {
//   try {
//     // Thử ping backend
//     await fetch(API_CONFIG.BASE_URL, { mode: 'no-cors' });
//     return true;
//   } catch (error) {
//     return false;
//   }
// };

// const authService = {
//   // ============ USER API v1 ============
  
//   // User Register
//   async registerUser(userData) {
//     const isBackendRunning = await checkBackend();
    
//     if (!isBackendRunning) {
//       console.warn('⚠️ Backend not running, throwing network error for mock handling');
//       throw new Error('Network Error');
//     }
    
//     try {
//       const response = await apiClientV1.post(API_CONFIG.ENDPOINTS.AUTH.USER_REGISTER, {
//         fullName: userData.fullName,
//         email: userData.email,
//         password: userData.password
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   // User Login
//   async loginUser(email, password) {
//     const isBackendRunning = await checkBackend();
    
//     if (!isBackendRunning) {
//       console.warn('⚠️ Backend not running, throwing network error for mock handling');
//       throw new Error('Network Error');
//     }
    
//     try {
//       const response = await apiClientV1.post(API_CONFIG.ENDPOINTS.AUTH.USER_LOGIN, {
//         email,
//         password
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   // User Logout
//   async logoutUser() {
//     const isBackendRunning = await checkBackend();
    
//     if (!isBackendRunning) {
//       console.warn('⚠️ Backend not running, throwing network error for mock handling');
//       throw new Error('Network Error');
//     }
    
//     try {
//       const response = await apiClientV1.post(API_CONFIG.ENDPOINTS.AUTH.USER_LOGOUT);
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   // User Forgot Password
//   async forgotPassword(email) {
//     const isBackendRunning = await checkBackend();
    
//     if (!isBackendRunning) {
//       console.warn('⚠️ Backend not running, throwing network error for mock handling');
//       throw new Error('Network Error');
//     }
    
//     try {
//       const response = await apiClientV1.post(API_CONFIG.ENDPOINTS.AUTH.USER_FORGOT_PASSWORD, { email });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   // User Verify OTP
//   async verifyOTP(email, otp) {
//     const isBackendRunning = await checkBackend();
    
//     if (!isBackendRunning) {
//       console.warn('⚠️ Backend not running, throwing network error for mock handling');
//       throw new Error('Network Error');
//     }
    
//     try {
//       const response = await apiClientV1.post(API_CONFIG.ENDPOINTS.AUTH.USER_VERIFY_OTP, { 
//         email, 
//         otp 
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   // User Reset Password
//   async resetPassword(email, otp, newPassword) {
//     const isBackendRunning = await checkBackend();
    
//     if (!isBackendRunning) {
//       console.warn('⚠️ Backend not running, throwing network error for mock handling');
//       throw new Error('Network Error');
//     }
    
//     try {
//       const response = await apiClientV1.post(API_CONFIG.ENDPOINTS.AUTH.USER_RESET_PASSWORD, { 
//         email, 
//         otp, 
//         newPassword 
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   // ============ MANAGER API v3 ============
  
//   // Manager Login
//   async loginManager(email, password) {
//     const isBackendRunning = await checkBackend();
    
//     if (!isBackendRunning) {
//       console.warn('⚠️ Backend not running, throwing network error for mock handling');
//       throw new Error('Network Error');
//     }
    
//     try {
//       const response = await apiClientV3.post(API_CONFIG.ENDPOINTS.AUTH.MANAGER_LOGIN, {
//         email,
//         password
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   // Manager Logout (endpoint /get theo yêu cầu)
//   async logoutManager() {
//     const isBackendRunning = await checkBackend();
    
//     if (!isBackendRunning) {
//       console.warn('⚠️ Backend not running, throwing network error for mock handling');
//       throw new Error('Network Error');
//     }
    
//     try {
//       const response = await apiClientV3.post(API_CONFIG.ENDPOINTS.AUTH.MANAGER_LOGOUT);
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   },

//   // ============ HELPER FUNCTIONS ============
  
//   // Lưu session vào localStorage
//   saveUserSession(token, user, version = 'v1') {
//     localStorage.setItem('token', token);
//     localStorage.setItem('user', JSON.stringify(user));
//     localStorage.setItem('apiVersion', version);
//   },

//   // Xóa session
//   clearUserSession() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     localStorage.removeItem('apiVersion');
//   },

//   // Kiểm tra đã đăng nhập chưa
//   isAuthenticated() {
//     const token = localStorage.getItem('token');
//     const user = localStorage.getItem('user');
//     return !!(token && user);
//   },

//   // Lấy thông tin user từ localStorage
//   getCurrentUser() {
//     const userStr = localStorage.getItem('user');
//     if (!userStr) return null;
    
//     try {
//       return JSON.parse(userStr);
//     } catch (error) {
//       console.error('Error parsing user data:', error);
//       return null;
//     }
//   },

//   // Lấy role của user
//   getUserRole() {
//     const user = this.getCurrentUser();
//     return user?.role || null;
//   },

//   // Kiểm tra có phải manager không
//   isManager() {
//     const role = this.getUserRole();
//     return role === 'MANAGER';
//   },

//   // Kiểm tra có phải admin không
//   isAdmin() {
//     const role = this.getUserRole();
//     return role === 'ADMIN';
//   },

//   // Kiểm tra có phải user thường không
//   isUser() {
//     const role = this.getUserRole();
//     return role === 'USER';
//   }
// };

// export default authService;