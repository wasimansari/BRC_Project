import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GalleryService, GalleryImage } from '../../services/gallery.service';
import { galleryCategories, GalleryCategory, app_constants } from '../../../constant';

@Component({
  selector: 'app-admin-gallery',
  templateUrl: './admin-gallery.component.html',
  styleUrls: ['./admin-gallery.component.css']
})
export class AdminGalleryComponent implements OnInit {
  galleryForm!: FormGroup;
  images: GalleryImage[] = [];
  filteredImages: GalleryImage[] = [];
  selectedCategory: string = 'all';
  editingImage: GalleryImage | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading: boolean = false;
  showModal: boolean = false;
  confirmDeleteId: string | null = null;
  showCategoryModal: boolean = false;
  categoryForm!: FormGroup;
  editingCategory: GalleryCategory | null = null;

  // Use categories from constants (will be merged with server data)
  categories: GalleryCategory[] = [...galleryCategories];
  tabsOrder: string[] = [...app_constants.galleryTabsOrder];
  
  // Track if categories have been modified locally
  categoriesModified: boolean = false;

  // Organize images by category for tab hierarchy display
  imagesByCategory: { [key: string]: GalleryImage[] } = {};

  constructor(
    private fb: FormBuilder,
    private galleryService: GalleryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initCategoryForm();
    this.loadCategoriesFromServer();
    this.loadImages();
  }

  loadCategoriesFromServer(): void {
    this.galleryService.getCategories().subscribe({
      next: (settings) => {
        if (settings) {
          const merged = this.galleryService.mergeCategories(settings.categories, settings.tabsOrder);
          this.categories = merged.categories;
          this.tabsOrder = merged.tabsOrder;
          this.organizeImagesByCategory();
        }
      },
      error: (err) => {
        console.error('Error loading categories from server:', err);
        // Use default categories on error
      }
    });
  }

  // Save categories to server whenever they are modified
  saveCategoriesToServer(): void {
    this.galleryService.saveCategories(this.categories, this.tabsOrder).subscribe({
      next: () => {
        this.categoriesModified = false;
      },
      error: (err) => {
        console.error('Error saving categories to server:', err);
      }
    });
  }

  initForm(): void {
    this.galleryForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      isActive: [true]
    });
  }

  initCategoryForm(): void {
    this.categoryForm = this.fb.group({
      value: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      label: ['', Validators.required],
      icon: ['fas fa-images', Validators.required]
    });
  }

  loadImages(): void {
    this.loading = true;
    this.galleryService.getAllGallery().subscribe({
      next: (data) => {
        this.images = data;
        this.organizeImagesByCategory();
        this.filterImages();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading gallery images:', err);
        this.loading = false;
      }
    });
  }

  organizeImagesByCategory(): void {
    this.imagesByCategory = {};
    
    // Initialize with all categories
    this.categories.forEach(cat => {
      this.imagesByCategory[cat.value] = [];
    });

    // Group images by category
    this.images.forEach(img => {
      if (!this.imagesByCategory[img.category]) {
        this.imagesByCategory[img.category] = [];
      }
      this.imagesByCategory[img.category].push(img);
    });
  }

  filterImages(): void {
    if (this.selectedCategory === 'all') {
      this.filteredImages = [...this.images];
    } else {
      this.filteredImages = this.images.filter(img => img.category === this.selectedCategory);
    }
  }

  onTabChange(category: string): void {
    this.selectedCategory = category;
    this.filterImages();
  }

  getCategoryLabel(value: string): string {
    return this.categories.find(c => c.value === value)?.label || value;
  }

  getCategoryIcon(value: string): string {
    return this.categories.find(c => c.value === value)?.icon || 'fas fa-image';
  }

  getCategoryClass(value: string): string {
    return value;
  }

  getCategoryCount(category: string): number {
    return this.imagesByCategory[category]?.length || 0;
  }

  getAllCount(): number {
    return this.images.length;
  }

  // Category Management
  openCategoryModal(category?: GalleryCategory): void {
    this.editingCategory = category || null;
    if (category) {
      this.categoryForm.patchValue({
        value: category.value,
        label: category.label,
        icon: category.icon
      });
    } else {
      this.categoryForm.reset({ value: '', label: '', icon: 'fas fa-images' });
    }
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.editingCategory = null;
  }

  onCategorySubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    const formValue = this.categoryForm.value;

    if (this.editingCategory) {
      // Update existing category
      const index = this.categories.findIndex(c => c.value === this.editingCategory!.value);
      if (index !== -1) {
        this.categories[index] = {
          ...this.categories[index],
          label: formValue.label,
          icon: formValue.icon
        };
        
        // Update tabs order if needed
        if (formValue.value !== this.editingCategory.value) {
          // Update category value for existing images
          this.updateImagesCategory(this.editingCategory.value, formValue.value);
          
          // Update order array
          const orderIndex = this.tabsOrder.indexOf(this.editingCategory.value);
          if (orderIndex !== -1) {
            this.tabsOrder[orderIndex] = formValue.value;
          }
          
          this.categories[index].value = formValue.value;
        }
        
        // Save to server
        this.categoriesModified = true;
        this.saveCategoriesToServer();
      }
      alert('Category updated successfully!');
    } else {
      // Add new category
      if (this.categories.find(c => c.value === formValue.value)) {
        alert('Category value already exists!');
        return;
      }

      this.categories.push({
        value: formValue.value,
        label: formValue.label,
        icon: formValue.icon,
        isDefault: false
      });
      
      // Add to tabs order at the end
      this.tabsOrder.push(formValue.value);
      
      // Initialize empty array for new category
      this.imagesByCategory[formValue.value] = [];
      
      // Save to server
      this.categoriesModified = true;
      this.saveCategoriesToServer();
      
      alert('Category added successfully!');
    }

    this.closeCategoryModal();
    this.loadImages();
  }

  updateImagesCategory(oldValue: string, newValue: string): void {
    // Update local images
    this.images.forEach(img => {
      if (img.category === oldValue) {
        img.category = newValue;
      }
    });
    this.organizeImagesByCategory();
  }

  deleteCategory(category: GalleryCategory): void {
    if (category.isDefault) {
      alert('Default categories cannot be deleted!');
      return;
    }

    const count = this.getCategoryCount(category.value);
    if (count > 0) {
      alert(`Cannot delete category with ${count} images. Please delete or move the images first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the "${category.label}" category?`)) {
      this.categories = this.categories.filter(c => c.value !== category.value);
      this.tabsOrder = this.tabsOrder.filter(t => t !== category.value);
      
      if (this.selectedCategory === category.value) {
        this.selectedCategory = 'all';
        this.filterImages();
      }
      
      // Save to server
      this.categoriesModified = true;
      this.saveCategoriesToServer();
      
      alert('Category deleted successfully!');
    }
  }

  // File handling
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Modal handling
  openAddModal(): void {
    this.editingImage = null;
    this.galleryForm.reset({ category: this.selectedCategory === 'all' ? '' : this.selectedCategory, title: '', description: '', isActive: true });
    this.selectedFile = null;
    this.previewUrl = null;
    this.showModal = true;
  }

  openEditModal(image: GalleryImage): void {
    this.editingImage = image;
    this.galleryForm.patchValue({
      category: image.category,
      title: image.title,
      description: image.description,
      isActive: image.isActive
    });
    this.previewUrl = image.imageUrl;
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingImage = null;
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onSubmit(): void {
    if (this.galleryForm.invalid) { 
      return;
    }

    const formData = new FormData();
    formData.append('category', this.galleryForm.get('category')?.value);
    formData.append('title', this.galleryForm.get('title')?.value);
    formData.append('description', this.galleryForm.get('description')?.value);
    formData.append('isActive', this.galleryForm.get('isActive')?.value);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.editingImage) {
      this.galleryService.updateGalleryImage(this.editingImage._id!, formData).subscribe({
        next: () => {
          this.loadImages();
          this.closeModal();
          alert('Image updated successfully!');
        },
        error: (err) => {
          console.error('Error updating image:', err);
          alert('Failed to update image');
        }
      });
    } else {
      if (!this.selectedFile) {
        alert('Please select an image');
        return;
      }
      this.galleryService.addGalleryImage(formData).subscribe({
        next: () => {
          this.loadImages();
          this.closeModal();
          alert('Image added successfully!');
        },
        error: (err) => {
          console.error('Error adding image:', err);
          alert('Failed to add image');
        }
      });
    }
  }

  confirmDelete(id: string): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  deleteImage(): void {
    if (!this.confirmDeleteId) return;

    this.galleryService.deleteGalleryImage(this.confirmDeleteId).subscribe({
      next: () => {
        this.loadImages();
        this.confirmDeleteId = null;
        alert('Image deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting image:', err);
        alert('Failed to delete image');
      }
    });
  }
}
