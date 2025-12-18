import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, isManager = false) => {
    try {
      const { default: axios } = await import('axios');
      
      // Chọn endpoint dựa trên loại tài khoản
      const endpoint = isManager 
        ? 'http://localhost:3370/api/v3/users/login'  // Manager login
        : 'http://localhost:3370/api/v1/users/login'; // User login
      
      console.log('📤 Logging in to:', endpoint);
      
      const response = await axios.post(endpoint, { email, password });
      
      console.log('📥 Login response:', response.data);
      
      if (response.data.code !== 200) {
        return { success: false, message: response.data.message || 'Đăng nhập thất bại!' };
      }
      
      const token = response.data.token;
      
      if (!token) {
        return { success: false, message: 'Không nhận được token từ server!' };
      }
      
      // QUAN TRỌNG: Gọi API detail để lấy thông tin đầy đủ (bao gồm avatar)
      let userData;
      
      try {
        console.log('ℹ️ Fetching user detail with token:', token.substring(0, 20) + '...');
        
        const detailResponse = await axios.get(
          isManager 
            ? 'http://localhost:3370/api/v3/users/detail'
            : 'http://localhost:3370/api/v1/users/detail',
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('📥 User detail response:', detailResponse.data);
        
        if (detailResponse.data.code === 200 && detailResponse.data.info) {
          userData = {
            _id: detailResponse.data.info._id,
            id: detailResponse.data.info._id,
            fullName: detailResponse.data.info.fullName,
            email: detailResponse.data.info.email,
            role: detailResponse.data.info.role || (isManager ? 'manager' : 'user'),
            avatar: detailResponse.data.info.avatar || '', // ← QUAN TRỌNG: Lấy avatar
            phone: detailResponse.data.info.phone || '',
            position_job: detailResponse.data.info.position_job || '',
            token: token
          };
          console.log('✅ Got user info with avatar:', userData.avatar ? 'Yes' : 'No');
        } else {
          throw new Error('Cannot get user info from detail API');
        }
      } catch (detailError) {
        console.error('❌ Failed to get user detail:', detailError);
        
        // Fallback: Dùng thông tin từ login response nếu có
        if (response.data.user) {
          console.log('🔄 Using fallback user info from login response');
          userData = {
            _id: response.data.user._id,
            id: response.data.user._id,
            fullName: response.data.user.fullName,
            email: response.data.user.email,
            role: response.data.user.role || (isManager ? 'manager' : 'user'),
            avatar: '', // Không có avatar trong fallback
            token: token
          };
        } else {
          // Ultimate fallback: Dùng email để tạo ID
          const emailHash = Array.from(email)
            .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
            .toString(16);
          
          userData = {
            _id: `user_${emailHash}`,
            id: `user_${emailHash}`,
            fullName: email.split('@')[0],
            email: email,
            role: isManager ? 'manager' : 'user',
            avatar: '',
            token: token,
            isEmailBasedId: true
          };
        }
      }
      
      console.log('💾 Saving user data to localStorage:', userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      return { 
        success: true, 
        message: 'Đăng nhập thành công!',
        user: userData
      };
    } catch (error) {
      console.error('Login error details:', error);
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy trên http://localhost:3370';
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (fullName, email, password) => {
    try {
      const { default: axios } = await import('axios');
      
      const response = await axios.post(
        'http://localhost:3370/api/v1/users/register',
        { fullName, email, password }
      );
      
      if (response.data.code !== 200) {
        return { success: false, message: response.data.message || 'Đăng ký thất bại!' };
      }
      
      // Sau khi đăng ký thành công, tự động login để lấy user info
      const loginResult = await login(email, password, false);
      return loginResult;
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi đăng ký';
      return { success: false, message: errorMsg };
    }
  };

  // Các hàm khác giữ nguyên
  const forgotPassword = async (email) => {
    try {
      const { default: axios } = await import('axios');
      
      const response = await axios.post(
        'http://localhost:3370/api/v1/users/password/forgot',
        { email }
      );
      
      if (response.data.code !== 200) {
        return { success: false, message: response.data.message || 'Email không tồn tại!!!' };
      }
      
      return { success: true, message: 'Đã gửi mã OTP qua email!!!' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi gửi OTP';
      return { success: false, message: errorMsg };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const { default: axios } = await import('axios');
      
      const response = await axios.post(
        'http://localhost:3370/api/v1/users/password/otp',
        { email, otp }
      );
      
      if (response.data.code !== 200) {
        return { success: false, message: response.data.message || 'OTP không hợp lệ' };
      }
      
      // Nếu có token, tự động login
      if (response.data.token) {
        // Tìm user theo email và đăng nhập
        const loginResult = await login(email, '', false);
        return loginResult;
      }
      
      return { success: true, message: 'Xác thực thành công!' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'OTP không hợp lệ';
      return { success: false, message: errorMsg };
    }
  };

  const resetPassword = async (email, password, confirmPassword) => {
    try {
      const { default: axios } = await import('axios');
      
      const response = await axios.post(
        'http://localhost:3370/api/v1/users/password/reset',
        { email, password, confirmPassword }
      );
      
      if (response.data.code !== 200) {
        return { success: false, message: response.data.message || 'Thay đổi mật khẩu thất bại!' };
      }
      
      return { success: true, message: 'Thành công! Vui lòng đăng nhập lại.' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi thay đổi mật khẩu';
      return { success: false, message: errorMsg };
    }
  };

  // Hàm kiểm tra có phải manager không
  const checkIsManager = (role) => {
    if (!role) return false;
    return role.toUpperCase() === 'MANAGER';
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    if (checkIsManager(user.role)) return true;
    
    if (user.role === 'admin') return true;
    
    return user.permissions?.includes(permission) || false;
  };

  // Thêm hàm updateUser để cập nhật thông tin user
  const updateUser = async (updatedData) => {
    try {
      const { default: authService } = await import('../services/authService');
      
      const result = await authService.updateProfile(updatedData);
      
      if (!result.success) {
        return result;
      }
      
      // Cập nhật user trong state
      const newUserData = { ...user, ...updatedData };
      delete newUserData.avatarFile;
      
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
      
      return result;
    } catch (error) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        message: error.message || 'Có lỗi xảy ra khi cập nhật' 
      };
    }
  };

  // THÊM HÀM refreshUser để lấy thông tin mới nhất từ server
  // const refreshUser = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     if (!token) return null;
      
  //     const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  //     const isManager = checkIsManager(currentUser.role);
      
  //     const { default: axios } = await import('axios');
      
  //     const response = await axios.get(
  //       isManager 
  //         ? 'http://localhost:3370/api/v3/users/detail'
  //         : 'http://localhost:3370/api/v1/users/detail',
  //       {
  //         headers: { 
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );
      
  //     if (response.data.code === 200 && response.data.info) {
  //       const updatedUser = {
  //         ...currentUser,
  //         ...response.data.info,
  //         _id: response.data.info._id,
  //         id: response.data.info._id,
  //         avatar: response.data.info.avatar || currentUser.avatar || '', // Giữ lại avatar nếu có
  //         token: token
  //       };
        
  //       localStorage.setItem('user', JSON.stringify(updatedUser));
  //       setUser(updatedUser);
  //       console.log('🔄 User refreshed, avatar:', updatedUser.avatar ? 'Yes' : 'No');
  //       return updatedUser;
  //     }
  //   } catch (error) {
  //     console.error('Refresh user error:', error);
  //   }
  //   return null;
  // };

  const fetchUserDetail = async () => {
    try {
      const { default: authService } = await import('../services/authService');
      
      const result = await authService.getProfile();
      
      if (result.success && result.data) {
        const newUserData = {
          ...user,
          ...result.data,
          _id: result.data._id,
          id: result.data._id,
          avatar: result.data.avatar || user?.avatar || '' // Giữ lại avatar
        };
        
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
        return { success: true, user: newUserData };
      }
      
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    forgotPassword,
    verifyOTP,
    resetPassword,
    hasPermission,
    updateUser,
    fetchUserDetail,
    
    isManager: () => {
      if (!user || !user.role) return false;
      return user.role.toUpperCase() === 'MANAGER';
    },
    getUserId: () => {
      return user?._id || user?.id;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};