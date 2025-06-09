const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async initAdmin() {
    return this.request('/auth/init-admin', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Customers
  async getCustomers() {
    return this.request('/customers/');
  }

  async createCustomer(customerData) {
    return this.request('/customers/', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(customerId, customerData) {
    return this.request(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(customerId) {
    return this.request(`/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  // Deliveries
  async getDeliveries() {
    return this.request('/deliveries/');
  }

  async getDailyDeliveries(date) {
    return this.request(`/deliveries/daily/${date}`);
  }

  async createDelivery(deliveryData) {
    return this.request('/deliveries/', {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    });
  }

  async updateDeliveryStatus(deliveryId, statusData) {
    return this.request(`/deliveries/${deliveryId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async updateDelivery(deliveryId, deliveryData) {
    return this.request(`/deliveries/${deliveryId}`, {
      method: 'PUT',
      body: JSON.stringify(deliveryData),
    });
  }

  async getDeliveryHistory(customerId) {
    return this.request(`/deliveries/history/${customerId}`);
  }

  // Reports
  async getDeliverySummary(startDate, endDate) {
    let url = '/reports/summary';
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return this.request(url);
  }

  async getCustomerReport(customerId, startDate, endDate) {
    let url = `/reports/customer/${customerId}`;
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return this.request(url);
  }

  async getDailyReport(date) {
    return this.request(`/reports/daily/${date}`);
  }

  logout() {
    this.setToken(null);
  }
}

export default new ApiService();

