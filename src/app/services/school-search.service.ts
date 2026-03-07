import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
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

  // Local fallback schools data for when API doesn't return results
  private localSchools: SchoolDetails[] = [
    {
      udise_code: '09140100101',
      school_name: 'Primary School Ahirori',
      category_name: 'Primary',
      type_name: 'Primary',
      address: 'Village Ahirori, Post Ahirori',
      block_name: 'Ahirori',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209743',
      principal_name: 'Sri Ram Singh',
      phone_no: '+91 98765 43210',
      email_id: 'ps.ahirori@school.edu'
    },
    {
      udise_code: '09140100102',
      school_name: 'Upper Primary School Ahirori',
      category_name: 'Upper Primary',
      type_name: 'Upper Primary',
      address: 'Village Ahirori, Post Ahirori',
      block_name: 'Ahirori',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209743',
      principal_name: 'Smt. Radhika Devi',
      phone_no: '+91 98765 43211',
      email_id: 'ups.ahirori@school.edu'
    },
    {
      udise_code: '09140100103',
      school_name: 'Government Primary School Ajhuva',
      category_name: 'Primary',
      type_name: 'Primary',
      address: 'Village Ajhuva, Post Ajhuva',
      block_name: 'Ajhuva',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209744',
      principal_name: 'Sri Prem Chandra',
      phone_no: '+91 98765 43212',
      email_id: 'gps.ajhuva@school.edu'
    },
    {
      udise_code: '09140100104',
      school_name: 'Primary School Amraudha',
      category_name: 'Primary',
      type_name: 'Primary',
      address: 'Village Amraudha, Post Amraudha',
      block_name: 'Amraudha',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209745',
      principal_name: 'Sri Dharmendra Kumar',
      phone_no: '+91 98765 43213',
      email_id: 'ps.amraudha@school.edu'
    },
    {
      udise_code: '09140100105',
      school_name: 'Government Upper Primary School Araziline',
      category_name: 'Upper Primary',
      type_name: 'Upper Primary',
      address: 'Village Araziline, Post Araziline',
      block_name: 'Araziline',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209746',
      principal_name: 'Smt. Vimla Devi',
      phone_no: '+91 98765 43214',
      email_id: 'gups.araziline@school.edu'
    },
    {
      udise_code: '09140100106',
      school_name: 'Primary School Asothar',
      category_name: 'Primary',
      type_name: 'Primary',
      address: 'Village Asothar, Post Asothar',
      block_name: 'Asothar',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209747',
      principal_name: 'Sri Ajay Kumar',
      phone_no: '+91 98765 43215',
      email_id: 'ps.asothar@school.edu'
    },
    {
      udise_code: '09140100107',
      school_name: 'Upper Primary School Atrauli',
      category_name: 'Upper Primary',
      type_name: 'Upper Primary',
      address: 'Village Atrauli, Post Atrauli',
      block_name: 'Atrauli',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209748',
      principal_name: 'Smt. Sarita Devi',
      phone_no: '+91 98765 43216',
      email_id: 'ups.atrauli@school.edu'
    },
    {
      udise_code: '09140100108',
      school_name: 'Primary School Auraiya',
      category_name: 'Primary',
      type_name: 'Primary',
      address: 'Village Auraiya, Post Auraiya',
      block_name: 'Auraiya',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209749',
      principal_name: 'Sri Ramesh Kumar',
      phone_no: '+91 98765 43217',
      email_id: 'ps.auraiya@school.edu'
    },
    {
      udise_code: '09140100901',
      school_name: 'Government High School Farrukhabad',
      category_name: 'High School',
      type_name: 'High School',
      address: 'Station Road, Farrukhabad',
      block_name: 'Farrukhabad',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209625',
      principal_name: 'Dr. O.P. Sharma',
      phone_no: '+91 98765 43218',
      email_id: 'ghs.farrukhabad@school.edu'
    },
    {
      udise_code: '09140100902',
      school_name: 'Government Inter College Fatehgarh',
      category_name: 'Intermediate',
      type_name: 'Intermediate',
      address: 'Civil Lines, Fatehgarh',
      block_name: 'Fatehgarh',
      district_name: 'Farrukhabad',
      state_name: 'Uttar Pradesh',
      pincode: '209601',
      principal_name: 'Dr. R.K. Singh',
      phone_no: '+91 98765 43219',
      email_id: 'gic.fatehgarh@school.edu'
    }
  ];

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
      map(response => {
        // API returns: { status: true, message: "success", data: { content: [...] } }
        // Check for status === true (boolean) or "success" (string)
        if (response && (response.status === true || response.status === 'success' || response.status === 'true')) {
          const schoolsData = response.data?.content || response.data;
          if (schoolsData && Array.isArray(schoolsData) && schoolsData.length > 0) {
            // Map the API response to our SchoolDetails format
            return this.mapUdiseSchoolToSchoolDetails(schoolsData[0]);
          }
        }
        // Fallback to local data when API doesn't return results
        const localResult = this.searchLocalByUdiseCode(udiseCode);
        if (localResult) {
          console.log('Using local fallback data for UDISE code:', udiseCode);
          return localResult;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching school data from API:', error);
        // Fallback to local data on error
        const localResult = this.searchLocalByUdiseCode(udiseCode);
        if (localResult) {
          console.log('Using local fallback data after API error for UDISE code:', udiseCode);
          return of(localResult);
        }
        return of(null);
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
      map(response => {
        // API returns: { status: true, message: "success", data: { content: [...] } }
        if (response && (response.status === true || response.status === 'success' || response.status === 'true')) {
          const schoolsData = response.data?.content || response.data;
          if (schoolsData && Array.isArray(schoolsData)) {
            return schoolsData.map((school: any) => this.mapUdiseSchoolToSchoolDetails(school));
          }
        }
        // Fallback to local data when API doesn't return results
        const localResults = this.searchLocalBySchoolName(schoolName);
        if (localResults.length > 0) {
          console.log('Using local fallback data for school name:', schoolName);
          return localResults;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching school data from API:', error);
        // Fallback to local data on error
        const localResults = this.searchLocalBySchoolName(schoolName);
        if (localResults.length > 0) {
          console.log('Using local fallback data after API error for school name:', schoolName);
          return of(localResults);
        }
        return of([]);
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
      map(response => {
        // API returns: { status: true, message: "success", data: { content: [...] } }
        if (response && (response.status === true || response.status === 'success' || response.status === 'true')) {
          const schoolsData = response.data?.content || response.data;
          if (schoolsData && Array.isArray(schoolsData)) {
            return schoolsData.map((school: any) => this.mapUdiseSchoolToSchoolDetails(school));
          }
        }
        // Fallback to local data when API doesn't return results
        const localResults = this.searchLocalByDistrict(district);
        if (localResults.length > 0) {
          console.log('Using local fallback data for district:', district);
          return localResults;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching school data from API:', error);
        // Fallback to local data on error
        const localResults = this.searchLocalByDistrict(district);
        if (localResults.length > 0) {
          console.log('Using local fallback data after API error for district:', district);
          return of(localResults);
        }
        return of([]);
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
      map(response => {
        // API returns: { status: true, message: "success", data: { content: [...] } }
        if (response && (response.status === true || response.status === 'success' || response.status === 'true')) {
          const schoolsData = response.data?.content || response.data;
          if (schoolsData && Array.isArray(schoolsData)) {
            return schoolsData.map((school: any) => this.mapUdiseSchoolToSchoolDetails(school));
          }
        }
        // Fallback to local data when API doesn't return results
        const localResults = this.searchLocalByBlock(block);
        if (localResults.length > 0) {
          console.log('Using local fallback data for block:', block);
          return localResults;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching school data from API:', error);
        // Fallback to local data on error
        const localResults = this.searchLocalByBlock(block);
        if (localResults.length > 0) {
          console.log('Using local fallback data after API error for block:', block);
          return of(localResults);
        }
        return of([]);
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
      schoolName: data.schoolName || data.school_name || '',
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
      typeName: data.typeName || data.type_name || ''
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
   */
  private isApiSuccess(response: any): boolean {
    return response && (response.status === true || response.status === 'success' || response.status === 'true');
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
      class12: enrollment?.class12 || 0
    };
  }

  // Local search helper methods
  private searchLocalByUdiseCode(udiseCode: string): SchoolDetails | null {
    const found = this.localSchools.find(school => 
      school.udise_code === udiseCode
    );
    return found || null;
  }

  private searchLocalBySchoolName(schoolName: string): SchoolDetails[] {
    const searchTerm = schoolName.toLowerCase();
    return this.localSchools.filter(school =>
      school.school_name?.toLowerCase().includes(searchTerm)
    );
  }

  private searchLocalByDistrict(district: string): SchoolDetails[] {
    const searchTerm = district.toLowerCase();
    return this.localSchools.filter(school =>
      school.district_name?.toLowerCase().includes(searchTerm)
    );
  }

  private searchLocalByBlock(block: string): SchoolDetails[] {
    const searchTerm = block.toLowerCase();
    return this.localSchools.filter(school =>
      school.block_name?.toLowerCase().includes(searchTerm)
    );
  }
}
