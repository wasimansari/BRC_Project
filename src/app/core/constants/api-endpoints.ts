/**
 * Centralized API Configuration
 * This file provides backward compatibility for services
 * and uses constants from src/constant.ts
 */

import { app_constants } from '../../../constant';

// Helper function to get full URL - used by services
export function getFullUrl(endpoint: string): string {
  return `${app_constants.baseUrl}${endpoint}`;
}

// Re-export search types for backward compatibility
export const SearchTypes = app_constants.searchTypes;

// Re-export API endpoints for backward compatibility
export const ApiEndpoints = {
  baseUrl: app_constants.baseUrl,
  udise: app_constants.udise,
  udiseKnowMore: app_constants.udiseKnowMore,
  udiseProfileDetail: app_constants.udiseProfileDetail,
  udiseEnrollmentDetail: app_constants.udiseEnrollmentDetail,
  auth: app_constants.auth,
  events: app_constants.events,
  news: app_constants.news,
  courses: app_constants.courses,
  banners: app_constants.banners,
  about: app_constants.about
};

// Re-export search type config for backward compatibility
export const SearchTypeConfig = app_constants.searchTypeConfig;

// Re-export districts and blocks for backward compatibility
export const UPDistricts = app_constants.upDistricts;
export const UPBlocks = app_constants.upBlocks;

// Re-export statistics for backward compatibility
export const SchoolSearchStats = app_constants.schoolSearchStats;
export const HomepageStatistics = app_constants.homepageStatistics;

// Re-export banners and testimonials for backward compatibility
export const DefaultBanners = app_constants.defaultBanners;
export const TestimonialsData = app_constants.testimonialsData;

// Re-export search type ID
export type SearchTypeId = 'udise' | 'school' | 'district' | 'block';
