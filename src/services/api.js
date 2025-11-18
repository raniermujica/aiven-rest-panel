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
      'ngrok-skip-browser-warning': 'true',
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

  async updateAppointmentStatus(appointmentId, status) {
    return this.request(`/api/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Customers
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/customers?${queryString}`);
  }

  async getCustomerProfile(customerId) {
    const response = await this.request(`/api/customers/${customerId}/profile`);
    return response;
  }

  async getCustomerStats() {
    return this.request('/api/customers/stats');
  }

  async toggleCustomerVip(customerId) {
    return this.request(`/api/customers/${customerId}/vip`, {
      method: 'PATCH',
    });
  }

  async getCustomer(customerId) {
    return this.request(`/api/customers/${customerId}`);
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

  getAppointmentsByStatus(period, startDate, endDate) {
    return this.request(`/api/analytics/appointments-status?period=${period}&startDate=${startDate}&endDate=${endDate}`);
  }

  getTopServices(limit = 5, startDate, endDate) {
    return this.request(`/api/analytics/top-services?limit=${limit}&startDate=${startDate}&endDate=${endDate}`);
  }

  getAppointmentsTimeline(days = 7, startDate, endDate) {
    return this.request(`/api/analytics/appointments-timeline?days=${days}&startDate=${startDate}&endDate=${endDate}`);
  }

  getRevenueStats(startDate, endDate) {
    return this.request(`/api/analytics/revenue?startDate=${startDate}&endDate=${endDate}`);
  }

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

  async getAppointmentById(appointmentId) {
    return this.request(`/api/appointments/${appointmentId}/details`);
  }

  async updateAppointment(appointmentId, data) {
    return this.request(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(appointmentId) {
    return this.request(`/api/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
  }

  async getCalendarReservations(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/api/appointments?${params.toString()}`);
  }
  /**
 * Marcar cliente como "En Mesa" (Check-in)
 */
async checkInAppointment(appointmentId) {
  return this.request(`/api/appointments/${appointmentId}/check-in`, {
    method: 'POST',
  });
}

/**
 * Marcar cliente como "Se fue" (Check-out)
 */
async checkOutAppointment(appointmentId) {
  return this.request(`/api/appointments/${appointmentId}/check-out`, {
    method: 'POST',
  });
}

  // --- FUNCIONES DE WHATSAPP ---
  async initializeWhatsApp() {
    return this.request('/api/whatsapp/initialize', {
      method: 'POST',
    });
  }

  async getWhatsAppStatus() {
    return this.request('/api/whatsapp/status');
  }

  async refreshWhatsAppQR() {
    return this.request('/api/whatsapp/refresh-qr', {
      method: 'POST',
    });
  }

  async disconnectWhatsApp() {
    return this.request('/api/whatsapp/disconnect', {
      method: 'POST',
    });
  }

  async deleteWhatsAppInstance() {
    return this.request('/api/whatsapp/delete', {
      method: 'DELETE',
    });
  }

  /**
 * Enviar email de confirmación de cita
 */
  async sendAppointmentConfirmation(appointmentId) {
    return this.request(`/api/emails/send-confirmation/${appointmentId}`, {
      method: 'POST',
    });
  }

  // Blocked Slots

  async getBlockedSlots(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request(`/api/blocked-slots?${params.toString()}`);
  }

  async createBlockedSlot(data) {
    return this.request('/api/blocked-slots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlockedSlot(blockId, data) {
    return this.request(`/api/blocked-slots/${blockId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBlockedSlot(blockId) {
    return this.request(`/api/blocked-slots/${blockId}`, {
      method: 'DELETE',
    });
  }

  async checkIfBlocked(datetime) {
    return this.request('/api/blocked-slots/check', {
      method: 'POST',
      body: JSON.stringify({ datetime }),
    });
  }

};

export const api = new APIService();