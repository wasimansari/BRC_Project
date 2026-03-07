import { Component, OnInit } from '@angular/core';
import { SchoolSearchService, SchoolDetails } from '../../services/school-search.service';
import { app_constants, SearchTypeId } from '../../../constant';

// Local school interface matching our database
interface LocalSchool {
  _id?: string;
  srNo: number;
  district: string;
  block: string;
  udiseCode: string;
  schoolName: string;
  hmHtName: string;
  mobileNo: string;
  crc: string;
  crcName: string;
  isActive: boolean;
}

interface School {
  udiseCode: string;
  schoolName: string;
  type: string;
  address: string;
  block: string;
  principal: string;
  phone: string;
  email: string;
  category: string;
  pincode: string;
  website: string;
  schMgmtDesc:string;
  classFrm:number;
  classTo:number;
  schoolStatusName:string;
  stateName:string;
  districtName:string;
  clusterName:string;
  villageName:string;
  schCatDesc:string;
  schLocDesc:string;
  schTypeDesc:string;
  lastmodifiedTime:string;
  latitude:number;
  longitude:number;
}

@Component({
  selector: 'app-search-school',
  templateUrl: './search-school.component.html',
  styleUrls: ['./search-school.component.css']
})
export class SearchSchoolComponent implements OnInit {
  
  constructor(private schoolSearchService: SchoolSearchService) {}
  
  ngOnInit(): void {
    // Component initialization
  }

  selectedSearchType: SearchTypeId = app_constants.searchTypeConfig.default as SearchTypeId;
  
  searchTypes: { id: SearchTypeId; label: string; icon: string }[] = app_constants.searchTypeConfig.types as { id: SearchTypeId; label: string; icon: string }[];

  udiseCode = '';
  schoolName = '';
  selectedDistrict = '';
  selectedBlock = '';

  districts = app_constants.upDistricts;

  blocks = app_constants.upBlocks;

  // Sample schools data - fallback when API is not available
  /*schools: School[] = [
    {
      udiseCode: '09140100101',
      name: 'Primary School Ahirori',
      type: 'Primary',
      address: 'Village Ahirori, Post Ahirori',
      block: 'Ahirori',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Sri Ram Singh',
      phone: '+91 98765 43210',
      email: 'ps.ahirori@school.edu',
      category: 'Primary',
      pincode: '209743',
      website: ''
    },
    {
      udiseCode: '09140100102',
      name: 'Upper Primary School Ahirori',
      type: 'Upper Primary',
      address: 'Village Ahirori, Post Ahirori',
      block: 'Ahirori',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Smt. Radhika Devi',
      phone: '+91 98765 43211',
      email: 'ups.ahirori@school.edu',
      category: 'Upper Primary',
      pincode: '209743',
      website: ''
    },
    {
      udiseCode: '09140100103',
      name: 'Government Primary School Ajhuva',
      type: 'Primary',
      address: 'Village Ajhuva, Post Ajhuva',
      block: 'Ajhuva',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Sri Prem Chandra',
      phone: '+91 98765 43212',
      email: 'gps.ajhuva@school.edu',
      category: 'Primary',
      pincode: '209744',
      website: ''
    },
    {
      udiseCode: '09140100104',
      name: 'Primary School Amraudha',
      type: 'Primary',
      address: 'Village Amraudha, Post Amraudha',
      block: 'Amraudha',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Sri Dharmendra Kumar',
      phone: '+91 98765 43213',
      email: 'ps.amraudha@school.edu',
      category: 'Primary',
      pincode: '209745',
      website: ''
    },
    {
      udiseCode: '09140100105',
      name: 'Government Upper Primary School Araziline',
      type: 'Upper Primary',
      address: 'Village Araziline, Post Araziline',
      block: 'Araziline',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Smt. Vimla Devi',
      phone: '+91 98765 43214',
      email: 'gups.araziline@school.edu',
      category: 'Upper Primary',
      pincode: '209746',
      website: ''
    },
    {
      udiseCode: '09140100106',
      name: 'Primary School Asothar',
      type: 'Primary',
      address: 'Village Asothar, Post Asothar',
      block: 'Asothar',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Sri Ajay Kumar',
      phone: '+91 98765 43215',
      email: 'ps.asothar@school.edu',
      category: 'Primary',
      pincode: '209747',
      website: ''
    },
    {
      udiseCode: '09140100107',
      name: 'Upper Primary School Atrauli',
      type: 'Upper Primary',
      address: 'Village Atrauli, Post Atrauli',
      block: 'Atrauli',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Smt. Sarita Devi',
      phone: '+91 98765 43216',
      email: 'ups.atrauli@school.edu',
      category: 'Upper Primary',
      pincode: '209748',
      website: ''
    },
    {
      udiseCode: '09140100108',
      name: 'Primary School Auraiya',
      type: 'Primary',
      address: 'Village Auraiya, Post Auraiya',
      block: 'Auraiya',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Sri Ramesh Kumar',
      phone: '+91 98765 43217',
      email: 'ps.auraiya@school.edu',
      category: 'Primary',
      pincode: '209749',
      website: ''
    },
    {
      udiseCode: '09140100901',
      name: 'Government High School Farrukhabad',
      type: 'High School',
      address: 'Station Road, Farrukhabad',
      block: 'Farrukhabad',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Dr. O.P. Sharma',
      phone: '+91 98765 43218',
      email: 'ghs.farrukhabad@school.edu',
      category: 'High School',
      pincode: '209625',
      website: ''
    },
    {
      udiseCode: '09140100902',
      name: 'Government Inter College Fatehgarh',
      type: 'Intermediate',
      address: 'Civil Lines, Fatehgarh',
      block: 'Fatehgarh',
      district: 'Farrukhabad',
      state: 'Uttar Pradesh',
      principal: 'Dr. R.K. Singh',
      phone: '+91 98765 43219',
      email: 'gic.fatehgarh@school.edu',
      category: 'Intermediate',
      pincode: '209601',
      website: ''
    }
  ];
*/
  filteredSchools: School[] = [];
  showResults = false;
  isLoading = false;
  errorMessage = '';

  stats = app_constants.schoolSearchStats;

  selectSearchType(type: SearchTypeId): void {
    this.selectedSearchType = type;
    this.showResults = false;
    this.filteredSchools = [];
  }

  getBadgeClass(type: string): string {
    const typeMap: { [key: string]: string } = {
      'Primary': 'badge-primary',
      'Upper Primary': 'badge-upper-primary',
      'High School': 'badge-high-school',
      'Intermediate': 'badge-intermediate'
    };
    return typeMap[type] || 'badge-primary';
  }

  onKeyPress(event: KeyboardEvent): void {
    const charCode = event.which || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  searchSchools(): void {
    this.showResults = true;
    this.filteredSchools = [];
    this.errorMessage = '';
    this.isLoading = true;

    switch (this.selectedSearchType) {
      case 'udise':
        if (this.udiseCode) {
          this.searchByUdiseCode(this.udiseCode);
        } else {
          this.isLoading = false;
          this.errorMessage = 'Please enter a UDISE code';
        }
        break;

      case 'school':
        if (this.schoolName) {
          this.searchBySchoolName(this.schoolName);
        } else {
          this.isLoading = false;
          this.errorMessage = 'Please enter a school name';
        }
        break;

      case 'district':
        if (this.selectedDistrict) {
          this.searchByDistrict(this.selectedDistrict);
        } else {
          this.isLoading = false;
          this.errorMessage = 'Please select a district';
        }
        break;

      case 'block':
        if (this.selectedBlock) {
          this.searchByBlock(this.selectedBlock);
        } else {
          this.isLoading = false;
          this.errorMessage = 'Please select a block';
        }
        break;
    }
  }

  searchByUdiseCode(udiseCode: string): void {
    this.schoolSearchService.searchByUdiseCode(udiseCode).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data) {
          this.filteredSchools = [this.mapApiResponseToSchool(data)];
          console.log(this.filteredSchools);
        } else {
          this.errorMessage = 'No school found with this UDISE code';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error fetching school data. Please try again.';
        console.error(err);
      }
    });
  }

  private searchBySchoolName(schoolName: string): void {
    this.schoolSearchService.searchBySchoolName(schoolName).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data.length > 0) {
          this.filteredSchools = data.map(s => this.mapApiResponseToSchool(s));
        } else {
          this.errorMessage = 'No schools found with this name';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error fetching school data. Please try again.';
        console.error(err);
      }
    });
  }

  private searchByDistrict(district: string): void {
    this.schoolSearchService.searchByDistrict(district).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data.length > 0) {
          this.filteredSchools = data.map(s => this.mapApiResponseToSchool(s));
        } else {
          this.errorMessage = 'No schools found in this district';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error fetching school data. Please try again.';
        console.error(err);
      }
    });
  }

  private searchByBlock(block: string): void {
    this.schoolSearchService.searchByBlock(block).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data.length > 0) {
          this.filteredSchools = data.map(s => this.mapApiResponseToSchool(s));
        } else {
          this.errorMessage = 'No schools found in this block';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Error fetching school data. Please try again.';
        console.error(err);
      }
    });
  }

  private mapApiResponseToSchool(data: SchoolDetails): School {
    return {
      udiseCode: data.udise_code || '',
      schoolName: data.school_name || '',
      type: data.type_name || data.category_name || 'Primary',
      address: data.address || '',
      block: data.block_name || '',
      districtName: data.district_name || '',
      stateName: data.state_name || '',
      principal: data.principal_name || 'N/A',
      phone: data.phone_no || 'N/A',
      email: data.email_id || 'N/A',
      category: data.category_name || '',
      pincode: data.pincode || '',
      website: data.website || '',
      schMgmtDesc:data.sch_Mgmt_Desc || '',
      classFrm:data.class_from || 0,
      classTo:data.class_to || 0,
      schoolStatusName:data.school_Status_Name || '',
      clusterName:data.cluster_Name || '',
      villageName:data.village_Name || '',
      schCatDesc:data.sch_Cat_Desc || '',
      schLocDesc:data.sch_Loc_Desc || '',
      schTypeDesc:data.sch_Type_Desc || '',
      lastmodifiedTime:data.last_modified_Time || '',
      latitude:data.latitude || 0,
      longitude:data.longitude || 0


    };
  }
}
