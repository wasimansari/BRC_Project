import { Component } from '@angular/core';

interface StaffMember {
  name: string;
  designation: string;
  mobile: string;
  email: string;
  image?: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

@Component({
  selector: 'app-about-page',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  // Vision & Mission
  visionMission = {
    vision: 'To be a leading educational institution that nurtures creativity, critical thinking, and lifelong learning among students, preparing them for success in an ever-changing world.',
    mission: [
      'Improve quality of education',
      'Teacher training & monitoring',
      'Policy implementation'
    ]
  };

  // BEO Profile
  beoProfile = {
    name: 'Dr. Rajesh Kumar',
    qualification: 'M.Ed., Ph.D. in Education',
    experience: '15+ Years in Educational Administration',
    mobile: '+91 98765 43210',
    email: 'beo@example.edu',
    message: 'It is my privilege to lead this institution towards excellence in education. We are committed to providing quality education and ensuring holistic development of every student. Together with dedicated teachers and supportive parents, we strive to create an environment where every child can flourish and reach their full potential.',
    image: 'assets/images/aboutus/beo-profile.webp'
  };

  // Organizational Structure
  organizationalStructure = [
    { role: 'Block Education Officer (BEO)', icon: 'fa-user-tie', color: '#1abc9c' },
    { role: 'Block Resource Person (BRP)', icon: 'fa-users', color: '#3498db' },
    { role: 'Cluster Resource Coordinator (CRC)', icon: 'fa-chalkboard-teacher', color: '#9b59b6' },
    { role: 'Support Staff', icon: 'fa-hands-helping', color: '#e67e22' }
  ];

  // Staff Details
  staffDetails: StaffMember[] = [
    { name: 'Mrs. Priya Sharma', designation: 'Principal', mobile: '+91 98765 43211', email: 'principal@school.edu' },
    { name: 'Mr. Amit Patel', designation: 'Vice Principal', mobile: '+91 98765 43212', email: 'viceprincipal@school.edu' },
    { name: 'Mrs. Sunita Devi', designation: 'Head Teacher', mobile: '+91 98765 43213', email: 'sunita@school.edu' },
    { name: 'Mr. Ramesh Kumar', designation: 'Senior Teacher', mobile: '+91 98765 43214', email: 'ramesh@school.edu' },
    { name: 'Mrs. Anjali Singh', designation: 'Science Teacher', mobile: '+91 98765 43215', email: 'anjali@school.edu' },
    { name: 'Mr. Vikram Joshi', designation: 'Math Teacher', mobile: '+91 98765 43216', email: 'vikram@school.edu' },
    { name: 'Mrs. Kavita Rao', designation: 'English Teacher', mobile: '+91 98765 43217', email: 'kavita@school.edu' },
    { name: 'Mr. Deepak Sharma', designation: 'Social Science Teacher', mobile: '+91 98765 43218', email: 'deepak@school.edu' }
  ];
}
