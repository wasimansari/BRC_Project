import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiEndpoints, SearchTypes } from '../core/constants/api-endpoints';
import { app_constants } from '../../constant';

export interface SchoolDetails {
  udise_code?: string;
  school_name?: string;
  sch_cate_id?: string;
  category_name?: string;
  sch_type_id?: string;
  type_name?: string;
  address?: string;
  block_name?: string;
  district_name?: string;
  state_name?: string;
  pincode?: string;
  principal_name?: string;
  phone_no?: string;
  email_id?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  sch_Mgmt_Desc?:string;
  class_from?:number;
  class_to?:number;
  school_Status_Name?:string;
  cluster_Name?:string;
  village_Name?:string;
  sch_Cat_Desc?:string;
  sch_Loc_Desc?:string;
  sch_Type_Desc?:string;
  last_modified_Time?:string;
  // schoolId from UDISE search API (different from UDISE code)
  schoolId?: string;
}

export interface UdiseApiResponse {
  status: string;
  data?: SchoolDetails[];
  message?: string;
}

export interface SchoolReportCard {
  schoolId?: string;
  schoolName?: string;
  schoolCategory?: string;
  schoolManagement?: string;
  class?: string;
  schoolType?: string;
  schoolLocation?: string;
  lgdBlock?: string;
  lgdPanchayat?: string;
  lgdVillage?: string;
  address?: string;
  pinCode?: string;
}

export interface SchoolProfileDetail {
  schoolId?: string;
  schoolName?: string;
  stateName?: string;
  districtName?: string;
  blockName?: string;
  clusterName?: string;
  villageName?: string;
  pincode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  estdYear?: string;
  managementName?: string;
  categoryName?: string;
  typeName?: string;
  totalTeachers?: number;
  totalStudents?: number;
  // Additional fields from profile API
  headMasterName?: string;
  respName?: string;
  website?: string;
  email?: string;
  phone?: string;
  boardSec?: number;
  boardHighSec?: number;
  boardSecName?: string;
  boardHighSecName?: string;
  recogYearPri?: string;
  recogYearUpr?: string;
  recogYearSec?: string;
  recogYearHsec?: string;
  cwsnSchYn?: number;
  cwsnSchYnDesc?: string;
  shiftSchYn?: number;
  shiftSchYnDesc?: string;
  resiSchYn?: number;
  resiSchDesc?: string;
  resiSchTypeName?: string;
  mediumOfInstrName1?: string;
  mediumOfInstrName2?: string;
  mediumOfInstrName3?: string;
  mediumOfInstrName4?: string;
  minorityYn?: number;
  minorityYnDesc?: string;
  anganwadiYn?: number;
  anganwadiYnDesc?: string;
  cceYn?: number;
  cceYnDesc?: string;
  smcYn?: number;
  smcYnDesc?: string;
  smdcYn?: number;
  smdcYnDesc?: string;
  approachRoadYnDesc?: string;
}

export interface SchoolEnrollmentDetail {
  schoolId?: string;
  totalStudents?: number;
  totalBoys?: number;
  totalGirls?: number;
  totalTeachers?: number;
  // Additional teacher details from API
  totalTeacherCon?: number;
  totalTeacherReg?: number;
  totalTeacherMale?: number;
  totalTeacherFemale?: number;
  prePrimary?: number;
  class1?: number;
  class2?: number;
  class3?: number;
  class4?: number;
  class5?: number;
  class6?: number;
  class7?: number;
  class8?: number;
  class9?: number;
  class10?: number;
  class11?: number;
  class12?: number;
}

export interface SchoolCompleteDetails {
  // Report Card Data (API 1)
  schoolId?: string;
  schoolName?: string;
  schoolCategory?: string;
  schoolManagement?: string;
  class?: string;
  schoolType?: string;
  schoolLocation?: string;
  lgdBlock?: string;
  lgdPanchayat?: string;
  lgdVillage?: string;
  address?: string;
  pinCode?: string;
  
  // Profile Detail Data (API 2)
  stateName?: string;
  districtName?: string;
  blockName?: string;
  clusterName?: string;
  villageName?: string;
  estdYear?: string;
  managementName?: string;
  categoryName?: string;
  typeName?: string;
  latitude?: number;
  longitude?: number;
  // Additional profile fields
  headMasterName?: string;
  respName?: string;
  website?: string | null;
  email?: string | null;
  phone?: string;
  boardSec?: number;
  boardHighSec?: number;
  boardSecName?: string;
  boardHighSecName?: string;
  recogYearPri?: string;
  recogYearUpr?: string;
  recogYearSec?: string;
  recogYearHsec?: string;
  cwsnSchYn?: number;
  cwsnSchYnDesc?: string;
  shiftSchYn?: number;
  shiftSchYnDesc?: string;
  resiSchYn?: number;
  resiSchDesc?: string;
  resiSchTypeName?: string;
  mediumOfInstrName1?: string;
  mediumOfInstrName2?: string;
  mediumOfInstrName3?: string;
  mediumOfInstrName4?: string;
  minorityYn?: number;
  minorityYnDesc?: string;
  anganwadiYn?: number;
  anganwadiYnDesc?: string;
  cceYn?: number;
  cceYnDesc?: string;
  smcYn?: number;
  smcYnDesc?: string;
  smdcYn?: number;
  smdcYnDesc?: string;
  approachRoadYnDesc?: string;
  
  // Enrollment Detail Data (API 3)
  totalStudents?: number;
  totalBoys?: number;
  totalGirls?: number;
  totalTeachers?: number;
  // Additional teacher details from API
  totalTeacherCon?: number;
  totalTeacherReg?: number;
  totalTeacherMale?: number;
  totalTeacherFemale?: number;
  prePrimary?: number;
  class1?: number;
  class2?: number;
  class3?: number;
  class4?: number;
  class5?: number;
  class6?: number;
  class7?: number;
  class8?: number;
  class9?: number;
  class10?: number;
  class11?: number;
  class12?: number;

  // Container for all three raw API responses
  completed?: {
    reportCard: SchoolReportCard | null;
    profile: SchoolProfileDetail | null;
    enrollment: SchoolEnrollmentDetail | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SchoolSearchService {
  private readonly API_URL = ApiEndpoints.udise.search;
  // Use the constant URL from constant.ts for facility API
  private readonly API_URL_KNOWMORE = app_constants.udiseKnowMore.knowMore;
  private readonly API_URL_PROFILE = app_constants.udiseProfileDetail.udiseProfile;
  private readonly API_URL_ENROLLMENT = app_constants.udiseEnrollmentDetail.udiseEnrollment;

  // Local fallback schools data removed, now relying on searchLocalSchools API fallback

  constructor(private http: HttpClient) { }

  /**
   * Search schools from local database
   */
  searchLocalSchools(filters: { district?: string; block?: string; search?: string } = {}): Observable<SchoolDetails[]> {
    const params = new HttpParams()
      .set('district', filters.district || '')
      .set('block', filters.block || '')
      .set('search', filters.search || '');
    
    return this.http.get<any[]>(app_constants.baseUrl + '/schools', { params }).pipe(
      map(schools => schools.map(s => ({
        udise_code: s.udiseCode,
        school_name: s.schoolName,
        block_name: s.block,
        district_name: s.district,
        principal_name: s.hmHtName,
        phone_no: s.mobileNo,
        category_name: s.crc === 'Yes' ? 'CRC' : 'Non-CRC'
      }))),
      catchError(error => {
        console.error('Error fetching local schools:', error);
        return of([]);
      })
    );
  }

  /**
   * Search schools by UDISE code
   * searchType=3 is for UDISE code search
   * @param udiseCode - 11-digit UDISE code
   */
  searchByUdiseCode(udiseCode: string): Observable<SchoolDetails | null> {
    const params = new HttpParams()
      .set('searchType', SearchTypes.BY_UDISE_CODE)
      .set('searchParam', udiseCode);

    return this.http.get<any>(this.API_URL, { params }).pipe(
      switchMap(response => {
        if (response && (response.status === true || response.status === 'success' || response.status === 'true')) {
          const schoolsData = response.data?.content || response.data;
          if (schoolsData && Array.isArray(schoolsData) && schoolsData.length > 0) {
            return of(this.mapUdiseSchoolToSchoolDetails(schoolsData[0]));
          }
        }
        // Fallback to local database when API doesn't return results
        return this.searchLocalSchools({ search: udiseCode }).pipe(
          map(localResults => localResults.length > 0 ? localResults[0] : null)
        );
      }),
      catchError(error => {
        console.error('Error fetching school data from API:', error);
        // Fallback to local database on error
        return this.searchLocalSchools({ search: udiseCode }).pipe(
          map(localResults => localResults.length > 0 ? localResults[0] : null)
        );
      })
    );
  }

  /**
   * Map UDISE API school response to SchoolDetails format
   */
  private mapUdiseSchoolToSchoolDetails(school: any): SchoolDetails {
    return {
      udise_code: school.udiseschCode || school.udise_code || '',
      school_name: school.schoolName || school.school_name || '',
      category_name: school.schCatName || school.category_name || '',
      type_name: school.schTypeName || school.type_name || '',
      address: school.address || school.villageName || '',
      block_name: school.blockName || school.block_name || '',
      district_name: school.districtName || school.district_name || '',
      state_name: school.stateName || school.state_name || '',
      pincode: school.pincode || '',
      principal_name: school.principalName || school.principal_name || '',
      phone_no: school.phoneNo || school.phone_no || '',
      email_id: school.emailId || school.email_id || '',
      website: school.website || '',
      // Get schoolId from the search API response (this is different from UDISE code)
      schoolId: school.schoolId || school.school_id || ''
    };
  }

  /**
   * Search schools by school name
   * searchType=1 is for school name search
   * @param schoolName - Name of the school
   */
  searchBySchoolName(schoolName: string): Observable<SchoolDetails[]> {
    const params = new HttpParams()
      .set('searchType', SearchTypes.BY_SCHOOL_NAME)
      .set('searchParam', schoolName);

    return this.http.get<any>(this.API_URL, { params }).pipe(
      switchMap(response => {
        if (response && (response.status === true || response.status === 'success' || response.status === 'true')) {
          const schoolsData = response.data?.content || response.data;
          if (schoolsData && Array.isArray(schoolsData) && schoolsData.length > 0) {
            return of(schoolsData.map((school: any) => this.mapUdiseSchoolToSchoolDetails(school)));
          }
        }
        // Fallback to local database when API doesn't return results
        return this.searchLocalSchools({ search: schoolName });
      }),
      catchError(error => {
        console.error('Error fetching school data from API:', error);
        // Fallback to local database on error
        return this.searchLocalSchools({ search: schoolName });
      })
    );
  }

  /**
   * Search schools by district
   * searchType=4 is for district search
   * @param district - District name
   */
  searchByDistrict(district: string): Observable<SchoolDetails[]> {
    const params = new HttpParams()
      .set('searchType', SearchTypes.BY_DISTRICT)
      .set('searchParam', district);

    return this.http.get<any>(this.API_URL, { params }).pipe(
      switchMap(response => {
        if (response && (response.status === true || response.status === 'success' || response.status === 'true')) {
          const schoolsData = response.data?.content || response.data;
          if (schoolsData && Array.isArray(schoolsData) && schoolsData.length > 0) {
            return of(schoolsData.map((school: any) => this.mapUdiseSchoolToSchoolDetails(school)));
          }
        }
        // Fallback to local database when API doesn't return results
        return this.searchLocalSchools({ district: district });
      }),
      catchError(error => {
        console.error('Error fetching school data from API:', error);
        // Fallback to local database on error
        return this.searchLocalSchools({ district: district });
      })
    );
  }

  /**
   * Search schools by block
   * searchType=5 is for block search
   * @param block - Block name
   */
  searchByBlock(block: string): Observable<SchoolDetails[]> {
    const params = new HttpParams()
      .set('searchType', SearchTypes.BY_BLOCK)
      .set('searchParam', block);

    return this.http.get<any>(this.API_URL, { params }).pipe(
      switchMap(response => {
        if (response && (response.status === true || response.status === 'success' || response.status === 'true')) {
          const schoolsData = response.data?.content || response.data;
          if (schoolsData && Array.isArray(schoolsData) && schoolsData.length > 0) {
            return of(schoolsData.map((school: any) => this.mapUdiseSchoolToSchoolDetails(school)));
          }
        }
        // Fallback to local database when API doesn't return results
        return this.searchLocalSchools({ block: block });
      }),
      catchError(error => {
        console.error('Error fetching school data from API:', error);
        // Fallback to local database on error
        return this.searchLocalSchools({ block: block });
      })
    );
  }

  /**
   * Get school facility details by school ID
   * @param schoolId - The UDISE code of the school
   * @deprecated Use getCompleteSchoolDetails instead
   */
  getSchoolFacility(schoolId: string): Observable<any> {
    // Use the constant URL from constant.ts and append schoolId
    const url = `${app_constants.udiseKnowMore.knowMore}${encodeURIComponent(schoolId)}`;
    console.log('Fetching facility from URL:', url);
    
    return this.http.get<any>(url).pipe(
      map(response => {
        // Console.log the full API response first
        console.log('School Facility API Response:', response);
        
        if (response && (response.status === true || response.status === 'success' || response.status === 'true' || response.data)) {
          const facilityData = response.data || response;
          console.log('Facility Data:', facilityData);
          return this.mapFacilityResponse(facilityData);
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching school facility:', error);
        return of(null);
      })
    );
  }

  /**
   * Map facility API response to SchoolReportCard format
   */
  private mapFacilityResponse(data: any): SchoolReportCard {
    return {
      schoolId: data.schoolId || data.schoolId || '',
      schoolName: data.schoolName || data.school_name || '',
      schoolCategory: data.schoolCategory || data.schCatDesc || '',
      schoolManagement: data.schoolManagement || data.schMgmtDesc || '',
      class: data.class || (data.classFrom ? `${data.classFrom} To ${data.classTo}` : ''),
      schoolType: data.schoolType || data.schTypeDesc || '',
      schoolLocation: data.schoolLocation || data.schLocDesc || '',
      lgdBlock: data.lgdBlock || data.lgdBlockName || data.blockName || '',
      lgdPanchayat: data.lgdPanchayat || data.lgdPanchayatName || '',
      lgdVillage: data.lgdVillage || data.lgdVillageName || data.villageName || '',
      address: data.address || '',
      pinCode: data.pinCode || data.pincode || ''
    };
  }

  /**
   * Get school profile details by school ID
   * @param schoolId - The school ID
   */
  getSchoolProfile(schoolId: string): Observable<SchoolProfileDetail | null> {
    const url = `${this.API_URL_PROFILE}${encodeURIComponent(schoolId)}`;
    console.log('Fetching profile from URL:', url);
    
    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('School Profile API Response:', response);
        
        if (response && (response.status === true || response.status === 'success' || response.status === 'true' || response.data)) {
          const profileData = response.data || response;
          console.log('Profile Data:', profileData);
          return this.mapProfileResponse(profileData);
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching school profile:', error);
        return of(null);
      })
    );
  }

  /**
   * Map profile API response to SchoolProfileDetail format
   */
  private mapProfileResponse(data: any): SchoolProfileDetail {
    return {
      schoolId: data.schoolId || data.school_id || '',
      schoolName: data.schoolName || data.school_name || data.respName || '',
      stateName: data.stateName || data.state_name || '',
      districtName: data.districtName || data.district_name || '',
      blockName: data.blockName || data.block_name || '',
      clusterName: data.clusterName || data.cluster_name || '',
      villageName: data.villageName || data.village_name || '',
      pincode: data.pincode || data.pinCode || '',
      address: data.address || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      estdYear: data.estdYear || data.established_year || '',
      managementName: data.managementName || data.management_name || '',
      categoryName: data.categoryName || data.category_name || '',
      typeName: data.typeName || data.type_name || '',
      // Additional fields from profile API
      headMasterName: data.headMasterName || data.respName || '',
      respName: data.respName || data.headMasterName || '',
      website: data.website || null,
      email: data.email || null,
      phone: data.schPhone || data.phone || '',
      boardSec: data.boardSec || 0,
      boardHighSec: data.boardHighSec || 0,
      boardSecName: data.boardSecName || '',
      boardHighSecName: data.boardHighSecName || '',
      recogYearPri: data.recogYearPri || null,
      recogYearUpr: data.recogYearUpr || null,
      recogYearSec: data.recogYearSec || null,
      recogYearHsec: data.recogYearHsec || null,
      cwsnSchYn: data.cwsnSchYn || 0,
      cwsnSchYnDesc: data.cwsnSchYnDesc || '',
      shiftSchYn: data.shiftSchYn || 0,
      shiftSchYnDesc: data.shiftSchYnDesc || '',
      resiSchYn: data.resiSchYn || 0,
      resiSchDesc: data.resiSchDesc || '',
      resiSchTypeName: data.resiSchTypeName || '',
      mediumOfInstrName1: data.mediumOfInstrName1 || '',
      mediumOfInstrName2: data.mediumOfInstrName2 || '',
      mediumOfInstrName3: data.mediumOfInstrName3 || '',
      mediumOfInstrName4: data.mediumOfInstrName4 || '',
      minorityYn: data.minorityYn || 0,
      minorityYnDesc: data.minorityYnDesc || '',
      anganwadiYn: data.anganwadiYn || 0,
      anganwadiYnDesc: data.anganwadiYnDesc || '',
      cceYn: data.cceYn || 0,
      cceYnDesc: data.cceYnDesc || '',
      smcYn: data.smcYn || 0,
      smcYnDesc: data.smcYnDesc || '',
      smdcYn: data.smdcYn || 0,
      smdcYnDesc: data.smdcYnDesc || '',
      approachRoadYnDesc: data.approachRoadYnDesc || ''
    };
  }

  /**
   * Get school enrollment details by school ID
   * @param schoolId - The school ID
   */
  getSchoolEnrollment(schoolId: string): Observable<SchoolEnrollmentDetail | null> {
    const url = `${this.API_URL_ENROLLMENT}${encodeURIComponent(schoolId)}`;
    console.log('Fetching enrollment from URL:', url);
    
    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('School Enrollment API Response:', response);
        
        if (response && (response.status === true || response.status === 'success' || response.status === 'true' || response.data)) {
          const enrollmentData = response.data || response;
          console.log('Enrollment Data:', enrollmentData);
          return this.mapEnrollmentResponse(enrollmentData);
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching school enrollment:', error);
        return of(null);
      })
    );
  }

  /**
   * Map enrollment API response to SchoolEnrollmentDetail format
   */
  private mapEnrollmentResponse(data: any): SchoolEnrollmentDetail {
    return {
      schoolId: data.schoolId || data.school_id || '',
      totalStudents: data.totalStudents || data.total_students || data.totalEnrolment || data.totalCount || 0,
      totalBoys: data.totalBoys || data.total_boys || data.boys || data.totalBoy || 0,
      totalGirls: data.totalGirls || data.total_girls || data.girls || data.totalGirl || 0,
      totalTeachers: data.totalTeachers || data.total_teachers || data.teachers || data.totalTeacherReg || 0,
      // Additional teacher details from API
      totalTeacherCon: data.totalTeacherCon || data.total_teacher_con || 0,
      totalTeacherReg: data.totalTeacherReg || data.total_teacher_reg || 0,
      totalTeacherMale: data.totalTeacherMale || data.total_teacher_male || 0,
      totalTeacherFemale: data.totalTeacherFemale || data.total_teacher_female || 0,
      prePrimary: data.prePrimary || data.pre_primary || data.classNursery || 0,
      class1: data.class1 || data.class_1 || 0,
      class2: data.class2 || data.class_2 || 0,
      class3: data.class3 || data.class_3 || 0,
      class4: data.class4 || data.class_4 || 0,
      class5: data.class5 || data.class_5 || 0,
      class6: data.class6 || data.class_6 || 0,
      class7: data.class7 || data.class_7 || 0,
      class8: data.class8 || data.class_8 || 0,
      class9: data.class9 || data.class_9 || 0,
      class10: data.class10 || data.class_10 || 0,
      class11: data.class11 || data.class_11 || 0,
      class12: data.class12 || data.class_12 || 0
    };
  }

  /**
   * Helper to check if API response status is successful
   * Also returns true if response has data (for APIs that return raw data without status)
   */
  private isApiSuccess(response: any): boolean {
    // Check for explicit success status
    if (response && (response.status === true || response.status === 'success' || response.status === 'true')) {
      return true;
    }
    // Check if response has data (for APIs that return raw data without status wrapper)
    if (response && (response.data || Object.keys(response).length > 0)) {
      return true;
    }
    return false;
  }

  /**
   * Get complete school details by calling all 3 APIs in parallel
   * Each API call handles its own errors so that even if one fails, others still return data
   * @param schoolId - The school ID
   */
  getCompleteSchoolDetails(schoolId: string): Observable<SchoolCompleteDetails | null> {
    console.log('Fetching complete details for school ID:', schoolId);
    
    // Each API call has its own error handling - returns null on error
    // This ensures forkJoin doesn't fail if one API fails
    const reportCard$ = this.http.get<any>(`${this.API_URL_KNOWMORE}${encodeURIComponent(schoolId)}`).pipe(
      map(response => {
        // Check API status before mapping
        if (this.isApiSuccess(response)) {
          return this.mapFacilityResponse(response?.data || response);
        }
        console.warn('Report card API returned unsuccessful status:', response?.status);
        return null;
      }),
      catchError(error => {
        console.error('Error fetching report card:', error);
        return of(null);
      })
    );
    
    const profile$ = this.http.get<any>(`${this.API_URL_PROFILE}${encodeURIComponent(schoolId)}`).pipe(
      map(response => {
        // Check API status before mapping
        if (this.isApiSuccess(response)) {
          return this.mapProfileResponse(response?.data || response);
        }
        console.warn('Profile API returned unsuccessful status:', response?.status);
        return null;
      }),
      catchError(error => {
        console.error('Error fetching profile:', error);
        return of(null);
      })
    );
    
    const enrollment$ = this.http.get<any>(`${this.API_URL_ENROLLMENT}${encodeURIComponent(schoolId)}`).pipe(
      map(response => {
        // Check API status before mapping
        if (this.isApiSuccess(response)) {
          return this.mapEnrollmentResponse(response?.data || response);
        }
        console.warn('Enrollment API returned unsuccessful status:', response?.status);
        return null;
      }),
      catchError(error => {
        console.error('Error fetching enrollment:', error);
        return of(null);
      })
    );
    
    // Call all 3 APIs in parallel using forkJoin
    // Each observable completes successfully (with null if error), so forkJoin always returns
    return forkJoin([reportCard$, profile$, enrollment$]).pipe(
      map(([reportCardData, profileData, enrollmentData]) => {
        console.log('Report Card Data:', reportCardData);
        console.log('Profile Data:', profileData);
        console.log('Enrollment Data:', enrollmentData);
        
        return this.combineAllData(reportCardData, profileData, enrollmentData);
      }),
      catchError(error => {
        console.error('Error in forkJoin:', error);
        return of(null);
      })
    );
  }

  /**
   * Combine data from all 3 APIs into single object
   */
  private combineAllData(
    reportCard: SchoolReportCard | null,
    profile: SchoolProfileDetail | null,
    enrollment: SchoolEnrollmentDetail | null
  ): SchoolCompleteDetails {
    return {
      // Report Card Data (API 1 - knowMore)
      schoolId: reportCard?.schoolId || profile?.schoolId || enrollment?.schoolId || '',
      schoolName: reportCard?.schoolName || profile?.schoolName || '',
      schoolCategory: reportCard?.schoolCategory || '',
      schoolManagement: reportCard?.schoolManagement || '',
      class: reportCard?.class || '',
      schoolType: reportCard?.schoolType || '',
      schoolLocation: reportCard?.schoolLocation || '',
      lgdBlock: reportCard?.lgdBlock || profile?.blockName || '',
      lgdPanchayat: reportCard?.lgdPanchayat || '',
      lgdVillage: reportCard?.lgdVillage || profile?.villageName || '',
      address: reportCard?.address || profile?.address || '',
      pinCode: reportCard?.pinCode || profile?.pincode || '',
      
      // Profile Detail Data (API 2 - profile)
      stateName: profile?.stateName || '',
      districtName: profile?.districtName || '',
      blockName: profile?.blockName || '',
      clusterName: profile?.clusterName || '',
      villageName: profile?.villageName || reportCard?.lgdVillage || '',
      estdYear: profile?.estdYear || '',
      managementName: profile?.managementName || '',
      categoryName: profile?.categoryName || '',
      typeName: profile?.typeName || '',
      latitude: profile?.latitude || 0,
      longitude: profile?.longitude || 0,
      // Additional profile fields from API
      headMasterName: profile?.headMasterName || '',
      respName: profile?.respName || '',
      website: profile?.website || undefined,
      email: profile?.email || undefined,
      phone: profile?.phone || '',
      boardSec: profile?.boardSec || 0,
      boardHighSec: profile?.boardHighSec || 0,
      boardSecName: profile?.boardSecName || '',
      boardHighSecName: profile?.boardHighSecName || '',
      recogYearPri: profile?.recogYearPri || undefined,
      recogYearUpr: profile?.recogYearUpr || undefined,
      recogYearSec: profile?.recogYearSec || undefined,
      recogYearHsec: profile?.recogYearHsec || undefined,
      cwsnSchYn: profile?.cwsnSchYn || 0,
      cwsnSchYnDesc: profile?.cwsnSchYnDesc || '',
      shiftSchYn: profile?.shiftSchYn || 0,
      shiftSchYnDesc: profile?.shiftSchYnDesc || '',
      resiSchYn: profile?.resiSchYn || 0,
      resiSchDesc: profile?.resiSchDesc || '',
      resiSchTypeName: profile?.resiSchTypeName || '',
      mediumOfInstrName1: profile?.mediumOfInstrName1 || '',
      mediumOfInstrName2: profile?.mediumOfInstrName2 || '',
      mediumOfInstrName3: profile?.mediumOfInstrName3 || '',
      mediumOfInstrName4: profile?.mediumOfInstrName4 || '',
      minorityYn: profile?.minorityYn || 0,
      minorityYnDesc: profile?.minorityYnDesc || '',
      anganwadiYn: profile?.anganwadiYn || 0,
      anganwadiYnDesc: profile?.anganwadiYnDesc || '',
      cceYn: profile?.cceYn || 0,
      cceYnDesc: profile?.cceYnDesc || '',
      smcYn: profile?.smcYn || 0,
      smcYnDesc: profile?.smcYnDesc || '',
      smdcYn: profile?.smdcYn || 0,
      smdcYnDesc: profile?.smdcYnDesc || '',
      approachRoadYnDesc: profile?.approachRoadYnDesc || '',
      
      // Enrollment Detail Data (API 3 - enrollment)
      totalStudents: enrollment?.totalStudents || 0,
      totalBoys: enrollment?.totalBoys || 0,
      totalGirls: enrollment?.totalGirls || 0,
      totalTeachers: enrollment?.totalTeachers || profile?.totalTeachers || 0,
      // Additional teacher details from API
      totalTeacherCon: enrollment?.totalTeacherCon || 0,
      totalTeacherReg: enrollment?.totalTeacherReg || 0,
      totalTeacherMale: enrollment?.totalTeacherMale || 0,
      totalTeacherFemale: enrollment?.totalTeacherFemale || 0,
      prePrimary: enrollment?.prePrimary || 0,
      class1: enrollment?.class1 || 0,
      class2: enrollment?.class2 || 0,
      class3: enrollment?.class3 || 0,
      class4: enrollment?.class4 || 0,
      class5: enrollment?.class5 || 0,
      class6: enrollment?.class6 || 0,
      class7: enrollment?.class7 || 0,
      class8: enrollment?.class8 || 0,
      class9: enrollment?.class9 || 0,
      class10: enrollment?.class10 || 0,
      class11: enrollment?.class11 || 0,
      class12: enrollment?.class12 || 0,

      // Store all three raw API responses in completed object
      completed: {
        reportCard: reportCard,
        profile: profile,
        enrollment: enrollment
      }
    };
  }

  // Local search helper methods removed in favor of searchLocalSchools
}
