const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

console.log('🔧 API_URL:', import.meta.env.VITE_API_URL);
console.log('🔧 SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);

export { API_URL };