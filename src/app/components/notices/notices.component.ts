import { Component, OnInit } from '@angular/core';
import { AnnouncementService, Announcement } from '../../services/announcement.service';
import { app_constants } from '../../../constant';

interface Notice {
  day: string;
  month: string;
  category: string;
  categoryClass: string;
  title: string;
  description: string;
  image?: string | null;
  link: string;
}

@Component({
  selector: 'app-notices',
  templateUrl: './notices.component.html',
  styleUrls: ['./notices.component.css'],
  styles: [`
    .notice-card {
      min-height: 250px;
      max-height: 350px;
    }
    .notice-description {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NoticesComponent implements OnInit {
  notices: Notice[] = [];
  loading = true;
  error = false;
  
  // Modal properties
  selectedNotice: Notice | null = null;
  showModal = false;

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements() {
    this.announcementService.getAnnouncements().subscribe({
      next: (data) => {
        this.notices = data.map(a => ({
          day: a.day,
          month: a.month,
          category: a.category,
          categoryClass: a.categoryClass,
          title: a.title,
          description: a.description,
          image: a.image ? `${app_constants.baseUrl.replace('/api', '')}${a.image}` : null,
          link: a.link || '/notices'
        }));
        // Save to localStorage for offline fallback
        this.announcementService.saveToLocalStorage(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading announcements:', err);
        // Try to load from localStorage as fallback
        const stored = this.announcementService.getFromLocalStorage();
        if (stored && stored.length > 0) {
          this.notices = stored.map(a => ({
            day: a.day,
            month: a.month,
            category: a.category,
            categoryClass: a.categoryClass,
            title: a.title,
            description: a.description,
            image: a.image ? `${app_constants.baseUrl.replace('/api', '')}${a.image}` : null,
            link: a.link || '/notices'
          }));
        } else {
          // Fallback to static data if no local storage
          this.notices = app_constants.noticesData as Notice[];
        }
        this.loading = false;
      }
    });
  }

  // Open modal with announcement details
  openModal(notice: Notice): void {
    this.selectedNotice = notice;
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  closeModal(): void {
    this.showModal = false;
    this.selectedNotice = null;
    document.body.style.overflow = 'auto';
  }

  // Handle click on "Read More" - opens modal instead of navigating
  onReadMore(event: Event, notice: Notice): void {
    event.preventDefault();
    this.openModal(notice);
  }
}
