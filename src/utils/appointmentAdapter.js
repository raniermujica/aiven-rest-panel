export function adaptAppointmentToReservation(appointment) {
  if (!appointment) return null;

  // Convertir fecha UTC a componentes separados
  const scheduledDate = new Date(appointment.scheduled_date);
  const appointmentTime = new Date(appointment.appointment_time);

  return {
    id: appointment.id,
    restaurant_id: appointment.restaurant_id,
    
    // Cliente (adaptado)
    customer_id: appointment.conversation_id, // Usar conversation_id como ID
    customers: {
      id: appointment.conversation_id,
      name: appointment.client_name,
      phone: appointment.client_phone,
      email: null,
      is_vip: false,
    },
    
    // Fecha/hora (adaptado)
    reservation_date: scheduledDate.toISOString().split('T')[0],
    reservation_time: appointmentTime.toISOString().split('T')[1].substring(0, 5),
    scheduled_date: appointment.scheduled_date,
    appointment_time: appointment.appointment_time,
    
    // Servicio
    service_id: appointment.service_id,
    services: appointment.services || {
      id: appointment.service_id,
      name: appointment.service_name,
    },
    service_name: appointment.service_name,
    duration_minutes: appointment.duration_minutes,
    
    // Otros campos
    party_size: 1, // Por defecto para salones de belleza
    special_requests: appointment.notes,
    notes: appointment.notes,
    status: appointment.status,
    source: 'whatsapp',
    google_calendar_event_id: appointment.google_calendar_event_id,
    sync_calendar: appointment.sync_calendar,
    
    // Timestamps
    created_at: appointment.created_at,
    updated_at: appointment.updated_at,
    confirmed_at: appointment.confirmed_at,
    cancelled_at: appointment.cancelled_at,
  };
}

export function adaptAppointmentsToReservations(appointments) {
  if (!Array.isArray(appointments)) return [];
  return appointments.map(adaptAppointmentToReservation);
}

// Adaptador inverso: reservations → appointments (para crear/actualizar)
export function adaptReservationToAppointment(reservation) {
  // Combinar fecha y hora en timestamp
  const scheduledDate = `${reservation.reservationDate}T${reservation.reservationTime}:00Z`;
  
  return {
    client_name: reservation.customerName,
    client_phone: reservation.customerPhone,
    scheduled_date: scheduledDate,
    appointment_time: scheduledDate,
    service_name: reservation.serviceName || 'Servicio',
    service_id: reservation.serviceId,
    duration_minutes: reservation.durationMinutes || 60,
    notes: reservation.specialRequests || '',
    google_calendar_event_id: reservation.googleCalendarEventId,
  };
};