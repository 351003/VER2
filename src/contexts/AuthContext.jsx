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
      
      // QUAN TRỌNG: Lấy user info từ response nếu có
      let userData;
      
      if (response.data.user) {
        // Trường hợp backend TRẢ VỀ user info trong login response
        console.log('✅ Got user info from login response');
        userData = {
          _id: response.data.user._id, // ← ID THẬT từ backend
          id: response.data.user._id, // ← Giữ cả id để tương thích
          fullName: response.data.user.fullName,
          email: response.data.user.email,
          role: response.data.user.role || (isManager ? 'manager' : 'user'),
          token: token
        };
      } else {
        // Trường hợp backend KHÔNG trả về user info → gọi API detail
        console.log('ℹ️ No user info in response, fetching from detail API...');
        try {
          const userResponse = await axios.get(
            isManager 
              ? 'http://localhost:3370/api/v3/users/detail'
              : 'http://localhost:3370/api/v1/users/detail',
            {
              headers: { 
                Cookie: `token=${token}`,
                'Content-Type': 'application/json'
              },
              withCredentials: true
            }
          );
          
          console.log('📥 User detail response:', userResponse.data);
          
          if (userResponse.data.code === 200 && userResponse.data.info) {
            userData = {
              _id: userResponse.data.info._id, // ← ID THẬT từ backend
              id: userResponse.data.info._id, // ← Giữ cả id để tương thích
              fullName: userResponse.data.info.fullName,
              email: userResponse.data.info.email,
              role: userResponse.data.info.role || (isManager ? 'manager' : 'user'),
              token: token
            };
          } else {
            // Fallback nếu không lấy được thông tin
            throw new Error('Cannot get user info');
          }
        } catch (detailError) {
          console.error('❌ Failed to get user detail:', detailError);
          
          // ULTIMATE FALLBACK: Dùng email để tạo ID ổn định
          const emailHash = Array.from(email)
            .reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)
            .toString(16);
          
          userData = {
            _id: `user_${emailHash}`, // ID từ email
            id: `user_${emailHash}`,
            fullName: email.split('@')[0],
            email: email,
            role: isManager ? 'manager' : 'user',
            token: token,
            isEmailBasedId: true
          };
        }
      }
      
      console.log('💾 Saving user data:', userData);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      return { 
        success: true, 
        message: 'Đăng nhập thành công!',
        user: userData // ← TRẢ VỀ user cho component
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
        const loginResult = await login(email, '', false); // Password không cần vì đã có token
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

  // Hàm kiểm tra có phải manager không (xử lý cả "manager" và "MANAGER")
  const checkIsManager = (role) => {
    if (!role) return false;
    return role.toUpperCase() === 'MANAGER';
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Manager có tất cả quyền (xử lý cả "manager" và "MANAGER")
    if (checkIsManager(user.role)) return true;
    
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
    hasPermission,
    // Thêm helper functions
    isManager: () => {
      if (!user || !user.role) return false;
      return checkIsManager(user.role);
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