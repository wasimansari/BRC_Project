import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { AuthService, AdminUser } from '../../services/auth.service';

export interface PagePermission {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

@Component({
  selector: 'app-admin-management',
  templateUrl: './admin-management.component.html',
  styleUrls: ['./admin-management.component.css']
})
export class AdminManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('modalSignatureCanvas') modalSignatureCanvas!: ElementRef<HTMLCanvasElement>;

  // Current logged in admin state
  currentAdmin: AdminUser | null = null;
  isMasterAdmin: boolean = false;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // All admins list (Master Admin ONLY)
  admins: AdminUser[] = [];
  filteredAdmins: AdminUser[] = [];
  searchQuery: string = '';
  roleFilter: string = '';
  statusFilter: string = '';

  // Available dashboard pages for page-wise access control
  readonly availablePages: PagePermission[] = [
    { id: 'banners', label: 'Banner Slider', icon: 'fas fa-images', desc: 'Home hero banners' },
    { id: 'events', label: 'Events', icon: 'fas fa-calendar-alt', desc: 'Upcoming events & schedules' },
    { id: 'news', label: 'News & Updates', icon: 'fas fa-newspaper', desc: 'Department and public news' },
    { id: 'courses', label: 'Courses', icon: 'fas fa-book', desc: 'Educational courses' },
    { id: 'trainings', label: 'Trainings', icon: 'fas fa-chalkboard-teacher', desc: 'Teacher training modules' },
    { id: 'about', label: 'About Page', icon: 'fas fa-info-circle', desc: 'Mission, BEO & staff details' },
    { id: 'gallery', label: 'Gallery', icon: 'fas fa-images', desc: 'Photo gallery albums' },
    { id: 'downloads', label: 'Downloads', icon: 'fas fa-download', desc: 'Documents and public files' },
    { id: 'schools', label: 'Schools', icon: 'fas fa-school', desc: 'Block schools directory' },
    { id: 'teacher-directory', label: 'Teacher Directory', icon: 'fas fa-id-badge', desc: 'Staff directory' },
    { id: 'teacher-docs', label: 'Teacher Docs & Approval', icon: 'fas fa-file-signature', desc: 'Review & sign teacher documents' },
    { id: 'announcements', label: 'Announcements', icon: 'fas fa-bullhorn', desc: 'Important notices & circulars' },
    { id: 'pageBackgrounds', label: 'Page Backgrounds', icon: 'fas fa-image', desc: 'Header banner imagery' },
    { id: 'testimonials', label: 'Testimonials', icon: 'fas fa-comments', desc: 'Feedback & community reviews' }
  ];

  // Statistics
  stats = {
    total: 0,
    masterAdmins: 0,
    subAdmins: 0,
    activeAdmins: 0
  };

  // My Profile Form
  profileForm = {
    name: '',
    email: '',
    contactNumber: '',
    designation: '',
    password: '',
    signature: '',
    signatureFile: null as File | null,
    signaturePreview: ''
  };

  // Admin Modal (Create / Edit)
  showModal: boolean = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedAdminId: string | null = null;
  isSavingAdmin: boolean = false;

  adminForm = {
    username: '',
    password: '',
    email: '',
    otp: '',
    name: '',
    contactNumber: '',
    designation: 'Sub Administrator',
    role: 'admin' as 'admin' | 'superadmin',
    isActive: true,
    allowedPages: ['teacher-docs'] as string[],
    signature: '',
    signatureFile: null as File | null,
    signaturePreview: ''
  };

  // OTP Verification state for creating sub-admin
  isSendingOtp: boolean = false;
  otpSent: boolean = false;
  isVerifyingOtp: boolean = false;
  isEmailVerified: boolean = false;
  otpSuccessMessage: string = '';
  otpErrorMessage: string = '';
  otpCountdown: number = 0;
  private timerInterval: any = null;

  // Zoom Signature modal
  zoomSignatureUrl: string | null = null;
  zoomAdminName: string = '';
  zoomAdminDesignation: string = '';

  // Canvas drawing state
  private isDrawing: boolean = false;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private modalCanvasCtx: CanvasRenderingContext2D | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isMasterAdmin = this.authService.isMasterAdmin();
    this.loadProfile();
    if (this.isMasterAdmin) {
      this.loadAdmins();
    }
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadProfile(): void {
    this.authService.getMyProfile().subscribe({
      next: (admin) => {
        this.currentAdmin = admin;
        this.isMasterAdmin = admin.role === 'superadmin';
        this.profileForm.name = admin.name || '';
        this.profileForm.email = admin.email || '';
        this.profileForm.contactNumber = admin.contactNumber || '';
        this.profileForm.designation = admin.designation || '';
        this.profileForm.signature = admin.signature || '';
        this.profileForm.signaturePreview = admin.signature || '';
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        const stored = this.authService.getCurrentAdmin();
        if (stored) {
          this.currentAdmin = stored;
          this.isMasterAdmin = stored.role === 'superadmin';
          this.profileForm.name = stored.name || '';
          this.profileForm.email = stored.email || '';
          this.profileForm.contactNumber = stored.contactNumber || '';
          this.profileForm.designation = stored.designation || '';
          this.profileForm.signature = stored.signature || '';
          this.profileForm.signaturePreview = stored.signature || '';
        }
      }
    });
  }

  loadAdmins(): void {
    if (!this.isMasterAdmin) return;
    this.isLoading = true;
    this.authService.getAllAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
        this.applyFilters();
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching admins:', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.admins.length;
    this.stats.masterAdmins = this.admins.filter(a => a.role === 'superadmin').length;
    this.stats.subAdmins = this.admins.filter(a => a.role === 'admin').length;
    this.stats.activeAdmins = this.admins.filter(a => a.isActive !== false).length;
  }

  applyFilters(): void {
    this.filteredAdmins = this.admins.filter(admin => {
      const matchRole = this.roleFilter ? admin.role === this.roleFilter : true;
      const matchStatus = this.statusFilter !== '' 
        ? (this.statusFilter === 'true' ? admin.isActive !== false : admin.isActive === false)
        : true;

      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = q
        ? (admin.username?.toLowerCase().includes(q) ||
           admin.name?.toLowerCase().includes(q) ||
           admin.email?.toLowerCase().includes(q) ||
           admin.designation?.toLowerCase().includes(q) ||
           admin.contactNumber?.toLowerCase().includes(q))
        : true;

      return matchRole && matchStatus && matchQuery;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // ────────────────── CANVAS DRAWING SIGNATURE ──────────────────
  private initCanvas(): void {
    if (this.signatureCanvas) {
      const canvas = this.signatureCanvas.nativeElement;
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = 140;
      this.canvasCtx = canvas.getContext('2d');
      if (this.canvasCtx) {
        this.canvasCtx.strokeStyle = '#0f172a';
        this.canvasCtx.lineWidth = 2.5;
        this.canvasCtx.lineCap = 'round';
        this.canvasCtx.lineJoin = 'round';
      }
    }
  }

  startDrawing(e: MouseEvent | TouchEvent, isModal: boolean = false): void {
    if (isModal && this.modalMode === 'create' && !this.isEmailVerified) return;
    this.isDrawing = true;
    const ctx = isModal ? this.modalCanvasCtx : this.canvasCtx;
    const canvas = isModal ? this.modalSignatureCanvas?.nativeElement : this.signatureCanvas?.nativeElement;
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    if ('touches' in e) e.preventDefault();
  }

  draw(e: MouseEvent | TouchEvent, isModal: boolean = false): void {
    if (!this.isDrawing) return;
    const ctx = isModal ? this.modalCanvasCtx : this.canvasCtx;
    const canvas = isModal ? this.modalSignatureCanvas?.nativeElement : this.signatureCanvas?.nativeElement;
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    if ('touches' in e) e.preventDefault();
  }

  stopDrawing(isModal: boolean = false): void {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    const canvas = isModal ? this.modalSignatureCanvas?.nativeElement : this.signatureCanvas?.nativeElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      if (isModal) {
        this.adminForm.signaturePreview = dataUrl;
        this.adminForm.signature = dataUrl;
        this.adminForm.signatureFile = null;
      } else {
        this.profileForm.signaturePreview = dataUrl;
        this.profileForm.signature = dataUrl;
        this.profileForm.signatureFile = null;
      }
    }
  }

  clearCanvas(isModal: boolean = false): void {
    const canvas = isModal ? this.modalSignatureCanvas?.nativeElement : this.signatureCanvas?.nativeElement;
    const ctx = isModal ? this.modalCanvasCtx : this.canvasCtx;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (isModal) {
      this.adminForm.signaturePreview = '';
      this.adminForm.signature = '';
      this.adminForm.signatureFile = null;
    } else {
      this.profileForm.signaturePreview = '';
      this.profileForm.signature = '';
      this.profileForm.signatureFile = null;
    }
  }

  onSignatureFileSelected(event: any, isModal: boolean = false): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isModal) {
          this.adminForm.signatureFile = file;
          this.adminForm.signaturePreview = e.target.result;
          this.adminForm.signature = e.target.result;
        } else {
          this.profileForm.signatureFile = file;
          this.profileForm.signaturePreview = e.target.result;
          this.profileForm.signature = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // ────────────────── SAVE PROFILE ──────────────────
  saveProfile(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('name', this.profileForm.name);
    formData.append('contactNumber', this.profileForm.contactNumber);
    formData.append('designation', this.profileForm.designation);

    if (this.profileForm.password) {
      formData.append('password', this.profileForm.password);
    }

    if (this.profileForm.signatureFile) {
      formData.append('signature', this.profileForm.signatureFile);
    } else if (this.profileForm.signature?.startsWith('data:image')) {
      formData.append('signatureBase64', this.profileForm.signature);
    }

    this.authService.updateMyProfile(formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Profile and digital signature updated successfully!';
        this.profileForm.password = '';
        this.loadProfile();
        if (this.isMasterAdmin) {
          this.loadAdmins();
        }
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Failed to update profile';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  // ────────────────── PAGE-WISE ACCESS TOGGLES ──────────────────
  togglePageAccess(pageId: string): void {
    const index = this.adminForm.allowedPages.indexOf(pageId);
    if (index > -1) {
      this.adminForm.allowedPages.splice(index, 1);
    } else {
      this.adminForm.allowedPages.push(pageId);
    }
  }

  isPageSelected(pageId: string): boolean {
    return this.adminForm.allowedPages.includes(pageId);
  }

  selectAllPages(): void {
    this.adminForm.allowedPages = this.availablePages.map(p => p.id);
  }

  clearAllPages(): void {
    this.adminForm.allowedPages = ['teacher-docs'];
  }

  getPageLabel(pageId: string): string {
    const page = this.availablePages.find(p => p.id === pageId);
    return page ? page.label : pageId;
  }

  // ────────────────── OTP EMAIL VERIFICATION ──────────────────
  sendVerificationOtp(): void {
    this.otpErrorMessage = '';
    this.otpSuccessMessage = '';

    const email = this.adminForm.email?.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      this.otpErrorMessage = 'Please enter a valid email address first.';
      return;
    }

    this.isSendingOtp = true;
    this.authService.sendSubAdminOtp({ email }).subscribe({
      next: (res) => {
        this.isSendingOtp = false;
        this.otpSent = true;
        this.otpSuccessMessage = res.message || `Verification OTP sent to ${email}. Please check the inbox.`;
        this.startOtpCountdown();
      },
      error: (err) => {
        this.isSendingOtp = false;
        this.otpErrorMessage = err?.error?.message || 'Failed to send OTP verification email.';
      }
    });
  }

  verifySubAdminOtp(): void {
    this.otpErrorMessage = '';
    this.otpSuccessMessage = '';

    const email = this.adminForm.email?.trim();
    const otp = this.adminForm.otp?.trim();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      this.otpErrorMessage = 'Please enter a valid email address.';
      return;
    }

    if (!otp || otp.length < 6) {
      this.otpErrorMessage = 'Please enter the complete 6-digit verification OTP code.';
      return;
    }

    this.isVerifyingOtp = true;
    this.authService.verifySubAdminOtp({ email, otp }).subscribe({
      next: (res) => {
        this.isVerifyingOtp = false;
        this.isEmailVerified = true;
        this.otpSuccessMessage = res.message || 'Email verified successfully! You can now fill in the sub-admin account details below.';
      },
      error: (err) => {
        this.isVerifyingOtp = false;
        this.isEmailVerified = false;
        this.otpErrorMessage = err?.error?.message || 'Invalid or expired OTP. Please verify and try again.';
      }
    });
  }

  private startOtpCountdown(): void {
    this.otpCountdown = 60;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.otpCountdown--;
      if (this.otpCountdown <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  // ────────────────── ADMIN CRUD (MASTER ADMIN) ──────────────────
  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedAdminId = null;
    this.otpSent = false;
    this.isEmailVerified = false;
    this.isVerifyingOtp = false;
    this.otpSuccessMessage = '';
    this.otpErrorMessage = '';
    this.adminForm = {
      username: '',
      password: '',
      email: '',
      otp: '',
      name: '',
      contactNumber: '',
      designation: 'Sub Administrator',
      role: 'admin',
      isActive: true,
      allowedPages: ['teacher-docs', 'news', 'trainings'],
      signature: '',
      signatureFile: null,
      signaturePreview: ''
    };
    this.showModal = true;
    setTimeout(() => this.initModalCanvas(), 150);
  }

  openEditModal(admin: AdminUser): void {
    this.modalMode = 'edit';
    this.selectedAdminId = admin._id || admin.id || '';
    this.otpSent = false;
    this.isEmailVerified = true;
    this.isVerifyingOtp = false;
    this.otpSuccessMessage = '';
    this.otpErrorMessage = '';
    this.adminForm = {
      username: admin.username,
      password: '',
      email: admin.email || '',
      otp: '',
      name: admin.name || '',
      contactNumber: admin.contactNumber || '',
      designation: admin.designation || '',
      role: admin.role,
      isActive: admin.isActive !== false,
      allowedPages: (admin.allowedPages && admin.allowedPages.length > 0)
        ? [...admin.allowedPages]
        : ['teacher-docs'],
      signature: admin.signature || '',
      signatureFile: null,
      signaturePreview: admin.signature || ''
    };
    this.showModal = true;
    setTimeout(() => this.initModalCanvas(), 150);
  }

  private initModalCanvas(): void {
    if (this.modalSignatureCanvas) {
      const canvas = this.modalSignatureCanvas.nativeElement;
      canvas.width = canvas.parentElement?.clientWidth || 360;
      canvas.height = 140;
      this.modalCanvasCtx = canvas.getContext('2d');
      if (this.modalCanvasCtx) {
        this.modalCanvasCtx.strokeStyle = '#0f172a';
        this.modalCanvasCtx.lineWidth = 2.5;
        this.modalCanvasCtx.lineCap = 'round';
        this.modalCanvasCtx.lineJoin = 'round';
      }
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAdminId = null;
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  submitAdminForm(): void {
    if (this.modalMode === 'create') {
      if (!this.isEmailVerified) {
        alert('Please verify the sub-admin email with OTP first before submitting.');
        return;
      }
      if (!this.adminForm.username || !this.adminForm.username.trim()) {
        alert('Username is required.');
        return;
      }
      if (!this.adminForm.password || !this.adminForm.password.trim()) {
        alert('Password is required.');
        return;
      }
      if (!this.adminForm.email || !/\S+@\S+\.\S+/.test(this.adminForm.email.trim())) {
        alert('A valid email address is required.');
        return;
      }
      if (!this.adminForm.otp || !this.adminForm.otp.trim()) {
        alert('Email verification OTP is required.');
        return;
      }
    }

    if (this.adminForm.allowedPages.length === 0) {
      alert('Please grant at least one page access for this sub-admin.');
      return;
    }

    this.isSavingAdmin = true;
    const formData = new FormData();
    formData.append('username', this.adminForm.username.trim());
    formData.append('email', this.adminForm.email.trim());
    formData.append('name', this.adminForm.name.trim());
    formData.append('contactNumber', this.adminForm.contactNumber.trim());
    formData.append('designation', this.adminForm.designation.trim());
    formData.append('role', this.adminForm.role);
    formData.append('isActive', String(this.adminForm.isActive));
    formData.append('allowedPages', JSON.stringify(this.adminForm.allowedPages));

    if (this.adminForm.password) {
      formData.append('password', this.adminForm.password.trim());
    }

    if (this.modalMode === 'create' && this.adminForm.otp) {
      formData.append('otp', this.adminForm.otp.trim());
    }

    if (this.adminForm.signatureFile) {
      formData.append('signature', this.adminForm.signatureFile);
    } else if (this.adminForm.signature?.startsWith('data:image')) {
      formData.append('signatureBase64', this.adminForm.signature);
    }

    if (this.modalMode === 'create') {
      this.authService.createAdminUser(formData).subscribe({
        next: () => {
          this.isSavingAdmin = false;
          this.closeModal();
          this.loadAdmins();
          alert('Sub-administrator verified by email and created successfully!');
        },
        error: (err) => {
          this.isSavingAdmin = false;
          alert(err?.error?.message || 'Failed to create sub-admin');
        }
      });
    } else if (this.modalMode === 'edit' && this.selectedAdminId) {
      this.authService.updateAdminUser(this.selectedAdminId, formData).subscribe({
        next: () => {
          this.isSavingAdmin = false;
          this.closeModal();
          this.loadAdmins();
          alert('Sub-administrator details and permissions updated successfully.');
        },
        error: (err) => {
          this.isSavingAdmin = false;
          alert(err?.error?.message || 'Failed to update sub-admin');
        }
      });
    }
  }

  toggleAdminStatus(admin: AdminUser): void {
    if (!this.isMasterAdmin) return;
    const adminId = admin._id || admin.id;
    if (!adminId) return;

    if (adminId === this.currentAdmin?._id || adminId === this.currentAdmin?.id) {
      alert('You cannot deactivate your own account.');
      return;
    }

    const newStatus = !admin.isActive;
    const confirmMsg = `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} admin account "${admin.username}"?`;
    if (!confirm(confirmMsg)) return;

    const formData = new FormData();
    formData.append('isActive', String(newStatus));

    this.authService.updateAdminUser(adminId, formData).subscribe({
      next: () => {
        admin.isActive = newStatus;
        this.calculateStats();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to update status');
      }
    });
  }

  canDeleteAdmin(admin: AdminUser): boolean {
    if (!this.isMasterAdmin || !admin) return false;
    // Primary master admin and superadmins cannot be deleted
    if (admin.username === 'admin' || admin.role === 'superadmin') return false;
    // Cannot delete currently logged in account
    const myId = this.currentAdmin?._id ? String(this.currentAdmin._id) : (this.currentAdmin?.id ? String(this.currentAdmin.id) : null);
    const targetId = admin._id ? String(admin._id) : (admin.id ? String(admin.id) : null);
    if (myId && targetId && myId === targetId) return false;
    if (this.currentAdmin?.username && admin.username === this.currentAdmin.username) return false;
    return true;
  }

  deleteAdmin(admin: AdminUser): void {
    if (!this.canDeleteAdmin(admin)) {
      alert('This administrator account cannot be deleted.');
      return;
    }
    const adminId = admin._id || admin.id;
    if (!adminId) {
      alert('Unable to identify administrator ID.');
      return;
    }

    const displayName = admin.name || admin.username;
    if (!confirm(`Are you sure you want to permanently delete sub-admin "${displayName}"? This cannot be undone.`)) {
      return;
    }

    this.isLoading = true;
    this.authService.deleteAdminUser(String(adminId)).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = `Sub-admin "${displayName}" has been deleted successfully.`;
        this.loadAdmins();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Failed to delete sub-admin';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  deleteAllSubAdmins(): void {
    if (!this.isMasterAdmin) return;
    if (this.stats.subAdmins === 0) {
      alert('There are no sub-administrators to delete.');
      return;
    }

    const confirmMsg = `WARNING: Are you sure you want to delete ALL (${this.stats.subAdmins}) sub-administrators?\n\nThis will permanently delete all sub-admin accounts. The Master Administrator account will remain untouched.\n\nDo you wish to continue?`;
    if (!confirm(confirmMsg)) return;

    this.isLoading = true;
    this.authService.deleteAllSubAdmins().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || 'All sub-administrators have been deleted successfully.';
        this.loadAdmins();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Failed to delete sub-admins';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // ────────────────── ZOOM SIGNATURE MODAL ──────────────────
  openZoomSignature(admin: AdminUser): void {
    if (!admin.signature) return;
    this.zoomSignatureUrl = admin.signature;
    this.zoomAdminName = admin.name || admin.username;
    this.zoomAdminDesignation = admin.designation || (admin.role === 'superadmin' ? 'Master Admin' : 'Admin');
  }

  closeZoomSignature(): void {
    this.zoomSignatureUrl = null;
  }
}
