import { Component } from '@angular/core';

interface GalleryPhoto {
  src: string;
  alt: string;
  title: string;
  description?: string;
}

interface GalleryDateGroup {
  date: string;
  eventName: string;
  category: string;
  photos: GalleryPhoto[];
}

interface Filter {
  id: string;
  name: string;
}

@Component({
  selector: 'app-gallery-page',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryPageComponent {
  activeFilter: string = 'all';
  lightboxOpen: boolean = false;
  currentLightboxImage: GalleryPhoto | null = null;
  currentLightboxIndex: number = 0;
  currentGalleryImages: GalleryPhoto[] = [];

  filters: Filter[] = [
    { id: 'science', name: 'Science Fair' },
    { id: 'sports', name: 'Sports Day' },
    { id: 'cultural', name: 'Cultural Festival' },
    { id: 'academic', name: 'Academic Events' }
  ];

  galleryData: GalleryDateGroup[] = [
    {
      date: 'June 15, 2024',
      eventName: 'Annual Science Fair 2024',
      category: 'science',
      photos: [
        { src: 'assets/images/events/science-fair.webp', alt: 'Science Fair Project 1', title: 'Student Project Exhibition', description: 'Innovative science projects by students' },
        { src: 'assets/images/events/science-fair.webp', alt: 'Science Fair Project 2', title: 'Robotics Display', description: 'Robotics demonstrations' },
        { src: 'assets/images/events/science-fair.webp', alt: 'Science Fair Project 3', title: 'Chemistry Experiment', description: 'Live chemistry experiments' }
      ]
    },
    {
      date: 'June 22, 2024',
      eventName: 'Sports Day Celebration',
      category: 'sports',
      photos: [
        { src: 'assets/images/events/sports-day.jpeg', alt: 'Sports Day 1', title: 'Track Events', description: 'Students competing in races' },
        { src: 'assets/images/events/sports-day.jpeg', alt: 'Sports Day 2', title: 'Team Activities', description: 'Group sports activities' },
        { src: 'assets/images/events/sports-day.jpeg', alt: 'Sports Day 3', title: 'Awards Ceremony', description: 'Prize distribution' }
      ]
    },
    {
      date: 'June 30, 2024',
      eventName: 'Cultural Festival',
      category: 'cultural',
      photos: [
        { src: 'assets/images/events/cultural-festival.webp', alt: 'Cultural 1', title: 'Dance Performance', description: 'Traditional dance by students' },
        { src: 'assets/images/events/cultural-festival.webp', alt: 'Cultural 2', title: 'Music Concert', description: 'Musical performances' },
        { src: 'assets/images/events/cultural-festival.webp', alt: 'Cultural 3', title: 'Art Exhibition', description: 'Student artwork display' }
      ]
    },
    {
      date: 'July 10, 2024',
      eventName: 'Annual Day Celebration',
      category: 'academic',
      photos: [
        { src: 'assets/images/events/science-fair.webp', alt: 'Annual Day 1', title: 'Drama Performance', description: 'Stage play by students' },
        { src: 'assets/images/events/cultural-festival.webp', alt: 'Annual Day 2', title: 'Award Distribution', description: 'Academic awards ceremony' }
      ]
    },
    {
      date: 'August 15, 2024',
      eventName: 'Independence Day Celebration',
      category: 'cultural',
      photos: [
        { src: 'assets/images/events/sports-day.jpeg', alt: 'Independence Day 1', title: 'Flag Hoisting', description: 'Independence Day ceremony' },
        { src: 'assets/images/events/cultural-festival.webp', alt: 'Independence Day 2', title: 'Patriotic Song', description: ' Patriotic performances' }
      ]
    }
  ];

  get filteredGallery(): GalleryDateGroup[] {
    if (this.activeFilter === 'all') {
      return this.galleryData;
    }
    return this.galleryData.filter(group => group.category === this.activeFilter);
  }

  filterGallery(filterId: string): void {
    this.activeFilter = filterId;
  }

  openLightbox(photo: GalleryPhoto, photos: GalleryPhoto[]): void {
    this.currentGalleryImages = photos;
    this.currentLightboxImage = photo;
    this.currentLightboxIndex = photos.indexOf(photo);
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    document.body.style.overflow = 'auto';
  }

  showImage(index: number, event: Event): void {
    event.stopPropagation();
    this.currentLightboxIndex = index;
    this.currentLightboxImage = this.currentGalleryImages[index];
  }

  prevImage(event: Event): void {
    event.stopPropagation();
    this.currentLightboxIndex = (this.currentLightboxIndex - 1 + this.currentGalleryImages.length) % this.currentGalleryImages.length;
    this.currentLightboxImage = this.currentGalleryImages[this.currentLightboxIndex];
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    this.currentLightboxIndex = (this.currentLightboxIndex + 1) % this.currentGalleryImages.length;
    this.currentLightboxImage = this.currentGalleryImages[this.currentLightboxIndex];
  }
}