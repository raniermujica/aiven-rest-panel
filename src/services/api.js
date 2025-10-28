import { API_URL } from '@/config/api';

class APIService {
  constructor() {
    this.baseURL = API_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    const businessSlug = localStorage.getItem('businessSlug');
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (businessSlug) {
      headers['x-business-slug'] = businessSlug;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en la petición');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email, password, slug) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, slug }),
    });
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // SuperAdmin
  async createBusiness(data) {
    return this.request('/api/superadmin/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listBusinesses() {
    return this.request('/api/superadmin/businesses');
  }

  // Reservations
  async getReservations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/appointments?${queryString}`);
  }

  async getTodayReservations() {
    return this.request('/api/appointments/today');
  }

  async getReservationStats() {
    return this.request('/api/appointments/stats');
  }

  async createReservation(data) {
    return this.request('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointmentStatus(reservationId, status) {
    return this.request(`/api/reservations/${reservationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Customers
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/customers?${queryString}`);
  }

  async getCustomer(customerId) {
    return this.request(`/api/customers/${customerId}`);
  }

  async getCustomerStats() {
    return this.request('/api/customers/stats');
  }

  async createCustomer(data) {
    return this.request('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(customerId, data) {
    return this.request(`/api/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Waitlist
  async getWaitlist() {
    return this.request('/api/waitlist');
  }

  async getWaitlistStats() {
    return this.request('/api/waitlist/stats');
  }

  async addToWaitlist(data) {
    return this.request('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWaitlistStatus(entryId, status) {
    return this.request(`/api/waitlist/${entryId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Analytics

  async getOverviewStats() {
    return this.request('/api/analytics/overview');
  }

  async getAppointmentsByStatus(period = 'monthly') {
    return this.request(`/api/analytics/appointments-status?period=${period}`);
  }

  async getTopServices(limit = 5) {
    return this.request(`/api/analytics/top-services?limit=${limit}`);
  }

  async getAppointmentsTimeline(days = 7) {
    return this.request(`/api/analytics/appointments-timeline?days=${days}`);
  }

  async getRevenueStats(period = 'monthly') {
    return this.request(`/api/analytics/revenue?period=${period}`);
  }

  // async getDashboardStats() {
  //   return this.request('/api/analytics/dashboard');
  // }

  // async getMonthlyStats(params = {}) {
  //   const queryString = new URLSearchParams(params).toString();
  //   return this.request(`/api/analytics/monthly?${queryString}`);
  // }

  // async getTopCustomers() {
  //   return this.request('/api/analytics/top-customers');
  // }

  // Settings
  async getSettings() {
    return this.request('/api/settings');
  }

  async updateSettings(data) {
    return this.request('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getBusinessUsers() {
    return this.request('/api/settings/users');
  }

  async createBusinessUser(data) {
    return this.request('/api/settings/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusinessUser(userId, data) {
    return this.request(`/api/settings/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBusinessUser(userId) {
    return this.request(`/api/settings/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getBusinessHours() {
    return this.request('/api/settings/hours');
  }

  async updateBusinessHours(hours) {
    return this.request('/api/settings/hours', {
      method: 'POST',
      body: JSON.stringify({ hours }),
    });
  }

  // Services
  async getServices() {
    return this.request('/api/services');
  }

  async createService(data) {
    return this.request('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(serviceId, data) {
    return this.request(`/api/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteService(serviceId) {
    return this.request(`/api/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  // Appointments
  async checkAppointmentAvailability(date, time, duration) {
    return this.request('/api/appointments/check-availability', {
      method: 'POST',
      body: JSON.stringify({ date, time, duration }),
    });
  }

  async createAppointment(data) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export const api = new APIService();