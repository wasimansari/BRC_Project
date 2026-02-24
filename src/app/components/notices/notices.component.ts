import { Component } from '@angular/core';

interface Notice {
  day: string;
  month: string;
  category: string;
  categoryClass: string;
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.css']
})
export class NoticesComponent {
  notices: Notice[] = [
    {
      day: '15',
      month: 'Jan',
      category: 'Academic',
      categoryClass: 'category-academic',
      title: 'Mid-Term Examination Schedule',
      description: 'The mid-term examinations for all classes will commence from 20th January. Parents are requested to ensure proper preparation of their children.',
      link: '/notices'
    },
    {
      day: '10',
      month: 'Jan',
      category: 'Event',
      categoryClass: 'category-event',
      title: 'Annual Sports Day 2025',
      description: 'Join us for the Annual Sports Day celebration on 25th January. Various competitions and activities are planned for all students.',
      link: '/events'
    },
    {
      day: '05',
      month: 'Jan',
      category: 'Notice',
      categoryClass: 'category-notice',
      title: 'School Transport Route Update',
      description: 'New bus routes have been finalized for the academic year 2024-25. Please check the transportation section for detailed information.',
      link: '/notices'
    },
    {
      day: '01',
      month: 'Jan',
      category: 'Holiday',
      categoryClass: 'category-holiday',
      title: 'Holiday Calendar 2025',
      description: 'The list of holidays for the year 2025 has been released. Please note the important dates for planning your family activities.',
      link: '/notices'
    },
    {
      day: '28',
      month: 'Dec',
      category: 'Academic',
      categoryClass: 'category-academic',
      title: 'New Session Registration Open',
      description: 'Registration for the academic session 2025-26 is now open. Last date for submission is 28th February 2025.',
      link: '/admissions'
    },
    {
      day: '20',
      month: 'Dec',
      category: 'Event',
      categoryClass: 'category-event',
      title: 'Science Exhibition',
      description: 'Students of classes 6-12 are invited to participate in the Science Exhibition. Last date for project submission is 15th January.',
      link: '/events'
    }
  ];
}