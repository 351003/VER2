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
      
      const response = await axios.post(endpoint, { email, password });
      
      if (response.data.code !== 200) {
        return { success: false, message: response.data.message || 'Đăng nhập thất bại!' };
      }
      
      const token = response.data.token;
      
      // Lấy thông tin user từ API detail
      let userData;
      try {
        // Gọi API để lấy thông tin chi tiết user
        const userResponse = await axios.get('http://localhost:3370/api/v1/users/detail', {
          headers: { Cookie: `token=${token}` }
        });
        
        if (userResponse.data.code === 200 && userResponse.data.info) {
          userData = {
            id: userResponse.data.info._id,
            name: userResponse.data.info.fullName,
            email: userResponse.data.info.email,
            role: isManager ? 'manager' : 'user',
            avatar: userResponse.data.info.avatar || null,
            permissions: []
          };
        } else {
          // Fallback nếu không lấy được thông tin
          userData = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email: email,
            role: isManager ? 'manager' : 'user',
            avatar: null,
            permissions: []
          };
        }
      } catch (error) {
        // Fallback nếu API detail lỗi
        userData = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email: email,
          role: isManager ? 'manager' : 'user',
          avatar: null,
          permissions: []
        };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true, message: 'Đăng nhập thành công!' };
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
      
      return { success: true, message: 'Tạo tài khoản thành công!' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi đăng ký';
      return { success: false, message: errorMsg };
    }
  };

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

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Manager có tất cả quyền
    if (user.role === 'manager') return true;
    
    // Admin có tất cả quyền (nếu có)
    if (user.role === 'admin') return true;
    
    // User thông thường kiểm tra permissions
    return user.permissions?.includes(permission) || false;
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
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};