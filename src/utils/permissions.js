// ==========================================
// DEFINICIÓN DE ROLES Y PERMISOS
// ==========================================

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF'
};

export const PERMISSIONS = {
  // Vistas
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_TODAY_APPOINTMENTS: 'view_today_appointments',
  VIEW_ALL_APPOINTMENTS: 'view_all_appointments',
  VIEW_CALENDAR: 'view_calendar',
  VIEW_CUSTOMERS: 'view_customers',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_SETTINGS: 'view_settings',
  
  // Acciones de Citas
  CREATE_APPOINTMENT: 'create_appointment',
  EDIT_APPOINTMENT: 'edit_appointment',
  DELETE_APPOINTMENT: 'delete_appointment',
  CHANGE_APPOINTMENT_STATUS: 'change_appointment_status',
  
  // Acciones de Clientes
  CREATE_CUSTOMER: 'create_customer',
  EDIT_CUSTOMER: 'edit_customer',
  DELETE_CUSTOMER: 'delete_customer',
  
  // Acciones de Configuración
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_SERVICES: 'manage_services',
};

// Mapa de roles a permisos
const rolePermissions = {
  [ROLES.ADMIN]: [
    // ADMIN: Acceso total
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_TODAY_APPOINTMENTS,
    PERMISSIONS.VIEW_ALL_APPOINTMENTS,
    PERMISSIONS.VIEW_CALENDAR,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.CREATE_APPOINTMENT,
    PERMISSIONS.EDIT_APPOINTMENT,
    PERMISSIONS.DELETE_APPOINTMENT,
    PERMISSIONS.CHANGE_APPOINTMENT_STATUS,
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.EDIT_CUSTOMER,
    PERMISSIONS.DELETE_CUSTOMER,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.MANAGE_SERVICES,
  ],
  
  [ROLES.MANAGER]: [
    // MANAGER: Todo menos configuraciones
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_TODAY_APPOINTMENTS,
    PERMISSIONS.VIEW_ALL_APPOINTMENTS,
    PERMISSIONS.VIEW_CALENDAR,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.CREATE_APPOINTMENT,
    PERMISSIONS.EDIT_APPOINTMENT,
    PERMISSIONS.DELETE_APPOINTMENT,
    PERMISSIONS.CHANGE_APPOINTMENT_STATUS,
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.EDIT_CUSTOMER,
    PERMISSIONS.DELETE_CUSTOMER,
  ],
  
  [ROLES.STAFF]: [
    // STAFF: Solo visualización y creación
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_TODAY_APPOINTMENTS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.CREATE_APPOINTMENT,
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.CHANGE_APPOINTMENT_STATUS,
    PERMISSIONS.VIEW_ALL_APPOINTMENTS
  ]
};

// Función principal para verificar permisos
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
};

// Verificar múltiples permisos (OR logic)
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Verificar múltiples permisos (AND logic)
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};