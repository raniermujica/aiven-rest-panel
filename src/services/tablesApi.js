const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Helper para hacer requests
 */
const fetchAPI = async (url, options = {}) => {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  
  return response.json();
};

/**
 * Obtener todas las mesas
 */
export const getTables = async (token, businessSlug) => {
  return fetchAPI(`${API_URL}/api/tables`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
    },
  });
};

/**
 * Crear una nueva mesa
 */
export const createTable = async (token, businessSlug, tableData) => {
  return fetchAPI(`${API_URL}/api/tables`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tableData),
  });
};

/**
 * Actualizar una mesa
 */
export const updateTable = async (token, businessSlug, tableId, tableData) => {
  return fetchAPI(`${API_URL}/api/tables/${tableId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tableData),
  });
};

/**
 * Eliminar una mesa
 */
export const deleteTable = async (token, businessSlug, tableId) => {
  return fetchAPI(`${API_URL}/api/tables/${tableId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
    },
  });
};

/**
 * Asignar mesa automáticamente
 */
export const assignTable = async (token, businessSlug, assignmentData) => {
  return fetchAPI(`${API_URL}/api/tables/assign`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignmentData),
  });
};

/**
 * Obtener estado de mesas para un día
 */
export const getTableStatus = async (token, businessSlug, date) => {
  const params = new URLSearchParams({ date });
  return fetchAPI(`${API_URL}/api/tables/status?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
    },
  });
};

/**
 * Crear asignación manual
 */
export const createTableAssignment = async (token, businessSlug, assignmentData) => {
  return fetchAPI(`${API_URL}/api/tables/assignments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-business-slug': businessSlug,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignmentData),
  });
};