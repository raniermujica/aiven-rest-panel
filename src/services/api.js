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

  // ================================================================
  // APPOINTMENTS
  // ================================================================
  
  async getAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/appointments?${queryString}`);
  }

  async getTodayAppointments() {
    return this.request('/api/appointments/today');
  }

  async getAppointmentStats() {
    return this.request('/api/appointments/stats');
  }

  async createAppointment(data) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointmentStatus(appointmentId, status) {
    return this.request(`/api/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteAppointment(appointmentId) {
    return this.request(`/api/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
  }

  // Reservations
  async getReservations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/reservations?${queryString}`);
  }

  async getTodayReservations() {
    return this.request('/api/reservations/today');
  }

  async getCalendarReservations(startDate, endDate) {
    const response = await apiClient.get('/reservations/calendar', {
      params: { startDate, endDate }
    });
    return response.data;
  }

  async getReservationStats() {
    return this.request('/api/reservations/stats');
  }

  async createReservation(data) {
    return this.request('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReservationStatus(reservationId, status) {
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
  async getWaitlist(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/waitlist?${queryString}`);
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
  async getDashboardStats() {
    return this.request('/api/analytics/dashboard');
  }

  async getMonthlyStats() {
    return this.request('/api/analytics/monthly');
  }

  async getTopCustomers(limit = 10) {
    return this.request(`/api/analytics/top-customers?limit=${limit}`);
  }
}

export const api = new APIService();