const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Obtener configuración de turnos
 */
export async function getSchedulesConfig(token, businessSlug) {
  const response = await fetch(`${API_URL}/schedules`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error obteniendo configuración de turnos');
  }

  return response.json();
}

/**
 * Actualizar configuración de turnos
 */
export async function updateSchedulesConfig(token, businessSlug, data) {
  const response = await fetch(`${API_URL}/schedules`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error actualizando configuración de turnos');
  }

  return response.json();
}

/**
 * Verificar si el restaurante está abierto
 */
export async function checkRestaurantOpen(token, businessSlug, date, time) {
  const params = new URLSearchParams({ date, time });
  
  const response = await fetch(`${API_URL}/schedules/check-open?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error verificando estado del restaurante');
  }

  return response.json();
};