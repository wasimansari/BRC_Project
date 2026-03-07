import { Component, OnInit } from '@angular/core';
import { GalleryService, GalleryImage, GallerySettings } from '../../services/gallery.service';
import { galleryCategories, GalleryCategory } from '../../../constant';

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
export class GalleryPageComponent implements OnInit {
  activeFilter: string = 'all';
  lightboxOpen: boolean = false;
  currentLightboxImage: GalleryPhoto | null = null;
  currentLightboxIndex: number = 0;
  currentGalleryImages: GalleryPhoto[] = [];
  loading: boolean = true;
  galleryImages: GalleryImage[] = [];

  get filters(): Filter[] {
    // Use dynamic categories from server, fallback to constants
    const categoryFilters: Filter[] = this.categories.map(cat => ({
      id: cat.value,
      name: cat.label
    }));
    return [{ id: 'all', name: 'All Events' }, ...categoryFilters];
  }

  // Dynamic categories from server
  categories: GalleryCategory[] = [...galleryCategories];
  
  galleryData: GalleryDateGroup[] = [];

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.loadCategoriesFromServer();
    this.loadGalleryImages();
  }

  loadCategoriesFromServer(): void {
    this.galleryService.getCategories().subscribe({
      next: (settings) => {
        if (settings) {
          const merged = this.galleryService.mergeCategories(settings.categories, settings.tabsOrder);
          this.categories = merged.categories;
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadGalleryImages(): void {
    this.loading = true;
    this.galleryService.getAllGallery().subscribe({
      next: (images) => {
        this.galleryImages = images.filter(img => img.isActive);
        this.organizeGalleryByCategory();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading gallery images:', err);
        this.loading = false;
      }
    });
  }

  organizeGalleryByCategory(): void {
    // Group images by category
    const categoryGroups = new Map<string, GalleryImage[]>();
    
    this.galleryImages.forEach(img => {
      const existing = categoryGroups.get(img.category) || [];
      existing.push(img);
      categoryGroups.set(img.category, existing);
    });

    // Convert to gallery date groups
    // Build category labels from dynamic categories
    const categoryLabels: { [key: string]: string } = {};
    this.categories.forEach(cat => {
      categoryLabels[cat.value] = cat.label;
    });

    this.galleryData = [];
    categoryGroups.forEach((images, category) => {
      const photos: GalleryPhoto[] = images.map(img => ({
        src: img.imageUrl,
        alt: img.title,
        title: img.title,
        description: img.description
      }));

      this.galleryData.push({
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        eventName: categoryLabels[category] || category,
        category: category,
        photos: photos
      });
    });
  }

  get filteredGallery(): GalleryDateGroup[] {
    if (this.activeFilter === 'all') {
      return this.galleryData;
    }
    // Map filter IDs to category values
    const categoryMap: { [key: string]: string } = {
      'science': 'science-fair',
      'sports': 'sports-day',
      'cultural': 'cultural-festival',
      'academic': 'academic-event'
    };
    const mappedCategory = categoryMap[this.activeFilter] || this.activeFilter;
    return this.galleryData.filter(group => group.category === mappedCategory);
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