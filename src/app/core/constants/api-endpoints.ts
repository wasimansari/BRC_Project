/**
 * Centralized API Endpoints Configuration
 * All API endpoints should be defined here
 */

export const ApiEndpoints = {
  // Base URL
  baseUrl: 'http://localhost:5000/api',

  // External UDISE API
  udise: {
    search: 'https://kys.udiseplus.gov.in/webapp/api/search-schools'
  },

  // Auth endpoints
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    createAdmin: '/auth/create-admin'
  },

  // Data endpoints
  events: {
    getAll: '/events',
    create: '/events',
    delete: '/events'
  },

  news: {
    getAll: '/news',
    create: '/news',
    delete: '/news'
  },

  courses: {
    getAll: '/courses',
    create: '/courses',
    delete: '/courses'
  },

  banners: {
    getAll: '/banners',
    getActive: '/banners',
    create: '/banners',
    update: '/banners',
    delete: '/banners'
  },

  about: {
    get: '/about',
    update: '/about',
    addStaff: '/about/staff',
    deleteStaff: '/about/staff'
  }
} as const;

// Helper function to get full URL
export function getFullUrl(endpoint: string): string {
  return `${ApiEndpoints.baseUrl}${endpoint}`;
}

// Search type constants for UDISE API
export const SearchTypes = {
  BY_SCHOOL_NAME: '1',
  BY_UDISE_CODE: '3',
  BY_DISTRICT: '4',
  BY_BLOCK: '5'
} as const;
