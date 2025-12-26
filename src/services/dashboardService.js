import { apiClientV1, apiClientV3 } from './api';

export const dashboardService = {
  async getDashboardData() {
    try {
      const userStr = localStorage.getItem('user');
      let userRole = 'user';
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userRole = user?.role?.toUpperCase() || 'USER';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      console.log('📊 Current user role:', userRole);
      
      let response;

      if (userRole === 'MANAGER') {
      response = await apiClientV3.get('/dashboard');
      console.log('📋 Manager API RESPONSE FULL:', JSON.stringify(response, null, 2));
      console.log('🔍 Checking response structure:');
      console.log('   - response.data?.projects:', response.data?.projects);
      console.log('   - response.data?.projects?.chartData2:', response.data?.projects?.chartData2);
    } else {
      response = await apiClientV1.get('/dashboard');
      console.log('📋 User API RESPONSE FULL:', JSON.stringify(response, null, 2));
    }
    
    // QUAN TRỌNG: Axios wrap response trong data property
    // Cần check response.data hay response
    console.log('🚨 IMPORTANT - Response structure:');
    console.log('   - Is axios response?', response?.data !== undefined);
    console.log('   - Direct response:', response);
    console.log('   - response.data:', response.data);
    
    // Return đúng phần dữ liệu
    return response.data || response; // Quan trọng!
    
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    throw error;
  }
},

  // FORMAT DASHBOARD DATA (giữ nguyên role logic)
  formatDashboardData(apiResponse, userRole) {
    console.log('🎨 Formatting dashboard data for role:', userRole);
    
    if (!apiResponse) {
      console.warn('⚠ API response is null or undefined');
      return null;
    }
    
    // Kiểm tra nếu response có lỗi code
    if (apiResponse.code && apiResponse.code !== 200) {
      console.warn('⚠ API returned error code:', apiResponse.code);
      return null;
    }
    
    // User (API v1)
    if (userRole === 'USER') {
      
      return {
        tasks: {
          totalTasks: apiResponse.tasks?.totalTasks || 0,
          pendingTasks: apiResponse.tasks?.pendingTasks || 0,
          productivity: apiResponse.tasks?.productivity || 0,
          chartData: apiResponse.tasks?.chartData || {
            'todo': 0,
            'in-progress': 0,
            'done': 0,
            'backlog': 0
          }
        },
        projects: {
          totalProjects: apiResponse.projects?.totalProjects || 0,
          pendingProjects: apiResponse.projects?.pendingProjetcs || 0,
          teamProjects: apiResponse.projects?.teamProjects || 0,
          productivityProject: apiResponse.projects?.productivityProject || 0,
          chartData2: apiResponse.projects?.chartData2 || {
            "not-started": 0,
            "in-progress": 0,
            "on-hold": 0,
            "completed": 0,
            "cancelled": 0
          }
        }
      };
    }
    
    // Manager (API v3)
   if (userRole === 'MANAGER') {
    console.log('🔄 Formatting MANAGER data...');
    
    // Manager API có thể chỉ có 'projects', không có 'tasks'
    const formattedData = {
      tasks: {
        totalTasks: apiResponse.tasks?.totalTasks || 0,
        pendingTasks: apiResponse.tasks?.pendingTasks || 0,
        productivity: apiResponse.tasks?.productivity || 0,
        chartData: apiResponse.tasks?.chartData || {
          'todo': 0,
          'in-progress': 0,
          'done': 0,
          'backlog': 0
        }
      },
      projects: {
        totalProjects: apiResponse.projects?.totalProjects || 0,
        totalPM: apiResponse.projects?.totalPM || 0,
        pendingProjects: apiResponse.projects?.pendingProjetcs || 0,
        teamProjects: apiResponse.projects?.teamProjects || 0,
        productivityProject: apiResponse.projects?.productivityProject || 0,
        chartData2: apiResponse.projects?.chartData2 || {
          "not-started": 0,
          "in-progress": 0,
          "on-hold": 0,
          "completed": 0,
          "cancelled": 0
        }
      }
    };
    
    console.log('✅ Formatted MANAGER data:', formattedData);
    return formattedData;
  }
  
  return null;
},

  // Lấy stat cards data
  getStatCardsData(dashboardData, userRole) {
  if (!dashboardData) {
    console.warn('⚠ No dashboard data provided');
    return {};
  }
  
  console.log('📈 Getting stat cards for role:', userRole);
  console.log('📊 dashboardData.projects:', dashboardData.projects);
  
  if (userRole === 'USER') {
    return {
      totalTasks: dashboardData.tasks?.totalTasks || 0,
      pendingTasks: dashboardData.tasks?.pendingTasks || 0,
      teamTasks: dashboardData.tasks?.teamTasks || 0,
      productivity: dashboardData.tasks?.productivity || 0
    };
  }
  
  if (userRole === 'MANAGER') {
    return {
      totalProjects: dashboardData.projects?.totalProjects || 0,
      totalPM: dashboardData.projects?.totalPM || 0,
      pendingProjects: dashboardData.projects?.pendingProjetcs || 0, // Lưu ý: "pendingProjetcs" (có lỗi chính tả)
      teamProjects: dashboardData.projects?.teamProjects || 0,
      productivityProject: dashboardData.projects?.productivityProject || 0
    };
  }
  
  return {};
},

  // Lấy task distribution data
  getTaskDistributionData(dashboardData) {
    if (!dashboardData?.tasks?.chartData) {
      console.log('📊 No task chart data available');
      return {
        labels: ['Todo', 'In Progress', 'Done', 'Backlog'],
        data: [0, 0, 0, 0],
        colors: ['#faad14', '#1890ff', '#52c41a', '#722ed1']
      };
    }
    
    const chart = dashboardData.tasks.chartData;
    
    console.log('📈 Task chart data for distribution:', chart);
    
    return {
      labels: ['Todo', 'In Progress', 'Done', 'Backlog'],
      data: [
        chart.todo || 0,
        chart['in-progress'] || 0,
        chart.done || 0,
        chart.backlog || 0
      ],
      colors: ['#faad14', '#1890ff', '#52c41a', '#722ed1']
    };
  },

  // Lấy project distribution data
getProjectDistributionData(dashboardData) {
  console.log('🔍 getProjectDistributionData called with:', dashboardData);
  
  // Default fallback
  const defaultResult = {
    labels: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
    data: [0, 0, 0, 0, 0],
    colors: ['#faad14', '#1890ff', '#722ed1', '#52c41a', '#ff4d4f']
  };
  
  if (!dashboardData) {
    console.log('❌ No dashboard data');
    return defaultResult;
  }
  
  console.log('📊 dashboardData.projects:', dashboardData.projects);
  console.log('📊 dashboardData.projects?.chartData2:', dashboardData.projects?.chartData2);
  
  const chartData2 = dashboardData.projects?.chartData2;
  
  if (!chartData2) {
    console.log('❌ No chartData2 found');
    return defaultResult;
  }
  
  // Xử lý chartData2
  let chartObj = chartData2;
  
  // Nếu là string, parse thành object
  if (typeof chartObj === 'string') {
    try {
      chartObj = JSON.parse(chartObj);
    } catch (e) {
      console.error('❌ Failed to parse chartData2 string:', e);
    }
  }
  
  // Lấy dữ liệu
  const data = [
    chartObj['not-started'] || 0,
    chartObj['in-progress'] || 0,
    chartObj['on-hold'] || 0,
    chartObj.completed || 0,
    chartObj.cancelled || 0
  ];
  
  console.log('✅ Final chart data:', data);
  
  return {
    labels: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
    data: data,
    colors: ['#faad14', '#1890ff', '#722ed1', '#52c41a', '#ff4d4f']
  };
},

  // XÓA HẲN getSampleData

  // Các hàm khác giữ nguyên
  getProjectProgressData(dashboardData) {
    return [
      { name: 'Website Redesign', progress: dashboardData?.projects?.productivityProject || 75 },
      { name: 'Mobile App', progress: 45 },
      { name: 'API Development', progress: 90 }
    ];
  },

  getRecentActivities() {
    return [
      {
        id: 1,
        user: 'You',
        action: 'completed',
        task: 'Design Homepage',
        time: '2 hours ago',
        type: 'success'
      },
      {
        id: 2,
        user: 'Trần Thị B',
        action: 'assigned you',
        task: 'Review API Documentation',
        time: '4 hours ago',
        type: 'info'
      },
      {
        id: 3,
        user: 'Lê Văn C',
        action: 'commented on',
        task: 'Mobile App Design',
        time: '1 day ago',
        type: 'warning'
      },
    ];
  },

  getUpcomingDeadlines() {
    return [
      { task: 'Finalize Design Mockups', date: 'Today, 5:00 PM', priority: 'high' },
      { task: 'Team Meeting', date: 'Tomorrow, 9:00 AM', priority: 'medium' },
      { task: 'Submit Monthly Report', date: 'Dec 15, 2024', priority: 'low' },
    ];
  }
};