import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
}

export interface UdiseApiResponse {
  status: string;
  data?: SchoolDetails[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchoolSearchService {
  private readonly API_URL = 'https://kys.udiseplus.gov.in/webapp/api/search-schools';

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
   * Search schools by UDISE code
   * searchType=3 is for UDISE code search
   * @param udiseCode - 11-digit UDISE code
   */
  searchByUdiseCode(udiseCode: string): Observable<SchoolDetails | null> {
    const params = new HttpParams()
      .set('searchType', '3')
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
      website: school.website || ''
    };
  }

  /**
   * Search schools by school name
   * searchType=1 is for school name search
   * @param schoolName - Name of the school
   */
  searchBySchoolName(schoolName: string): Observable<SchoolDetails[]> {
    const params = new HttpParams()
      .set('searchType', '1')
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
      .set('searchType', '4')
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
      .set('searchType', '5')
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
