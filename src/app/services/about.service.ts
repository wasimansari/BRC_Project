import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface AboutContent {
  _id?: string;
  vision?: string;
  mission?: string[];
  beoProfile?: BEOProfile;
  organizationalStructure?: OrgStructure[];
  staffDetails?: StaffMember[];
  updatedAt?: Date;
}

export interface BEOProfile {
  name: string;
  qualification: string;
  experience: string;
  mobile: string;
  email: string;
  message: string;
  image: string;
}

export interface OrgStructure {
  role: string;
  icon: string;
  color: string;
}

export interface StaffMember {
  _id?: string;
  id?: number;
  name: string;
  designation: string;
  mobile: string;
  email: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AboutService {
  private readonly ABOUT_ENDPOINT = getFullUrl('/about');
  private readonly STAFF_ENDPOINT = getFullUrl('/about/staff');

  // Local fallback about data
  private localAbout: AboutContent = {
    vision: 'To be a leading educational institution that nurtures creativity, critical thinking, and lifelong learning among students, preparing them for success in an ever-changing world.',
    mission: [
      'Improve quality of education',
      'Teacher training & monitoring',
      'Policy implementation'
    ],
    beoProfile: {
      name: 'Dr. Rajesh Kumar',
      qualification: 'M.Ed., Ph.D. in Education',
      experience: '15+ Years in Educational Administration',
      mobile: '+91 98765 43210',
      email: 'beo@example.edu',
      message: 'It is my privilege to lead this institution towards excellence in education. We are committed to providing quality education and ensuring holistic development of every student. Together with dedicated teachers and supportive parents, we strive to create an environment where every child can flourish and reach their full potential.',
      image: 'assets/images/aboutus/beo-profile.webp'
    },
    organizationalStructure: [
      { role: 'Block Education Officer (BEO)', icon: 'fa-user-tie', color: '#1abc9c' },
      { role: 'Block Resource Person (BRP)', icon: 'fa-users', color: '#3498db' },
      { role: 'Cluster Resource Coordinator (CRC)', icon: 'fa-chalkboard-teacher', color: '#9b59b6' },
      { role: 'Support Staff', icon: 'fa-hands-helping', color: '#e67e22' }
    ],
    staffDetails: [
      { name: 'Mrs. Priya Sharma', designation: 'Principal', mobile: '+91 98765 43211', email: 'principal@school.edu' },
      { name: 'Mr. Amit Patel', designation: 'Vice Principal', mobile: '+91 98765 43212', email: 'viceprincipal@school.edu' },
      { name: 'Mrs. Sunita Devi', designation: 'Head Teacher', mobile: '+91 98765 43213', email: 'sunita@school.edu' },
      { name: 'Mr. Ramesh Kumar', designation: 'Senior Teacher', mobile: '+91 98765 43214', email: 'ramesh@school.edu' },
      { name: 'Mrs. Anjali Singh', designation: 'Science Teacher', mobile: '+91 98765 43215', email: 'anjali@school.edu' },
      { name: 'Mr. Vikram Joshi', designation: 'Math Teacher', mobile: '+91 98765 43216', email: 'vikram@school.edu' },
      { name: 'Mrs. Kavita Rao', designation: 'English Teacher', mobile: '+91 98765 43217', email: 'kavita@school.edu' },
      { name: 'Mr. Deepak Sharma', designation: 'Social Science Teacher', mobile: '+91 98765 43218', email: 'deepak@school.edu' }
    ]
  };

  constructor(private http: HttpClient) {}

  /**
   * Get about content from API
   */
  getAbout(): Observable<AboutContent> {
    return this.http.get<AboutContent>(this.ABOUT_ENDPOINT).pipe(
      map(response => response || this.localAbout),
      catchError(error => {
        console.error('Error fetching about content from API:', error);
        // Try to get from localStorage first
        const stored = localStorage.getItem('aboutContent');
        if (stored) {
          return of(JSON.parse(stored));
        }
        return of(this.localAbout);
      })
    );
  }

  /**
   * Update about content - Vision & Mission only
   */
  updateVisionMission(vision: string, mission: string[]): Observable<AboutContent> {
    const formData = new FormData();
    formData.append('vision', vision);
    formData.append('mission', JSON.stringify(mission));
    return this.http.put<AboutContent>(this.ABOUT_ENDPOINT, formData);
  }

  /**
   * Update BEO Profile with image upload
   */
  updateBeoProfile(beoProfile: BEOProfile, imageFile?: File, existingImage?: string): Observable<AboutContent> {
    const formData = new FormData();
    formData.append('beoName', beoProfile.name);
    formData.append('beoQualification', beoProfile.qualification);
    formData.append('beoExperience', beoProfile.experience);
    formData.append('beoMobile', beoProfile.mobile);
    formData.append('beoEmail', beoProfile.email);
    formData.append('beoMessage', beoProfile.message);
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (existingImage) {
      formData.append('existingImage', existingImage);
    }
    return this.http.put<AboutContent>(this.ABOUT_ENDPOINT, formData);
  }

  /**
   * Update organizational structure
   */
  updateOrgStructure(orgStructure: OrgStructure[]): Observable<AboutContent> {
    const formData = new FormData();
    formData.append('organizationalStructure', JSON.stringify(orgStructure));
    return this.http.put<AboutContent>(this.ABOUT_ENDPOINT, formData);
  }

  /**
   * Update staff details
   */
  updateStaffDetails(staffDetails: StaffMember[]): Observable<AboutContent> {
    const formData = new FormData();
    formData.append('staffDetails', JSON.stringify(staffDetails));
    return this.http.put<AboutContent>(this.ABOUT_ENDPOINT, formData);
  }

  /**
   * Update entire about content (legacy method)
   */
  updateAbout(content: AboutContent | FormData): Observable<AboutContent> {
    return this.http.put<AboutContent>(this.ABOUT_ENDPOINT, content);
  }

  /**
   * Get local fallback about content
   */
  getLocalAbout(): AboutContent {
    return this.localAbout;
  }

  /**
   * Save to localStorage
   */
  saveToLocalStorage(content: AboutContent): void {
    localStorage.setItem('aboutContent', JSON.stringify(content));
  }

  /**
   * Add a new staff member
   */
  addStaff(staff: StaffMember | FormData): Observable<StaffMember> {
    return this.http.post<StaffMember>(`${this.ABOUT_ENDPOINT}/staff`, staff);
  }

  /**
   * Delete a staff member
   */
  deleteStaff(id: string): Observable<void> {
    return this.http.delete<void>(`${this.ABOUT_ENDPOINT}/staff/${id}`);
  }

  /**
   * Add organizational structure item
   */
  addOrgStructure(item: OrgStructure): Observable<OrgStructure> {
    return this.http.post<OrgStructure>(`${this.ABOUT_ENDPOINT}/org-structure`, item);
  }

  /**
   * Delete organizational structure item
   */
  deleteOrgStructure(index: number): Observable<void> {
    return this.http.delete<void>(`${this.ABOUT_ENDPOINT}/org-structure/${index}`);
  }
}
