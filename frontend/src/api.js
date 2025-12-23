const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: 'include', // Include cookies for session authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, get text or use empty object
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    }
    
    if (!response.ok) {
      // Handle different error formats
      const errorMessage = data.error || data.message || data.detail || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Tidak dapat menyambung ke pelayan. Sila pastikan pelayan Django berjalan di http://localhost:8000');
    }
    throw error;
  }
}

// Authentication API
export const authAPI = {
  register: async (username, password, email, phone_number, state) => {
    return apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ 
        username, 
        password, 
        password_confirm: password, 
        email,
        phone_number,
        state
      }),
    });
  },

  login: async (username, password) => {
    return apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout/', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me/');
  },
};

// Voucher API
export const voucherAPI = {
  getVoucher: async () => {
    return apiRequest('/vouchers/');
  },

  useVoucher: async () => {
    return apiRequest('/vouchers/use_voucher/', {
      method: 'POST',
    });
  },
};

