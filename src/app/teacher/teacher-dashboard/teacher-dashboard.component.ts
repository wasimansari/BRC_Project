import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherAuthService, TeacherDocument } from '../../services/teacher-auth.service';
import { SalarySlipService, SalarySlipStatement, ColumnConfig, TeacherSalaryRow } from '../../services/salary-slip.service';
import { TeacherMasterService, MasterTeacher } from '../../services/teacher-master.service';
import { getFullUrl } from '../../core/constants/api-endpoints';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit {
  teacherData: any = null;
  documents: TeacherDocument[] = [];
  
  // UI State
  activeTab = 'salary-slip'; // 'salary-slip', 'teacher-master', 'upload', 'my-docs', 'profile'
  isLoading = false;
  isUploading = false;
  toastMessage = '';
  toastType = 'success'; // 'success' or 'error'

  // Upload Form
  uploadTitle = '';
  uploadType = 'Letter';
  uploadDesc = '';
  selectedFile: File | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  // ══════════════════════════════════════════════════════════════════
  // SALARY SLIP & ABSENTEE STATEMENT STATE
  // ══════════════════════════════════════════════════════════════════
  salaryStatements: SalarySlipStatement[] = [];
  currentStatement: SalarySlipStatement | null = null;
  salaryViewMode: 'list' | 'editor' | 'print' = 'list';
  isLoadingSalary = false;
  isSavingSalary = false;

  // Modals state
  showColumnManagerModal = false;
  showAddColumnModal = false;
  showPaySlipModal = false;
  selectedTeacherSlip: TeacherSalaryRow | null = null;

  // New column form model
  newCol: {
    label: string;
    type: 'text' | 'number' | 'date';
    category: 'info' | 'earning' | 'deduction' | 'other';
    defaultValue: string;
  } = {
    label: '',
    type: 'text',
    category: 'info',
    defaultValue: ''
  };

  // Month options
  monthsList: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Default rates for salary engine
  daRate: number = 63;
  hraRate: number = 5;
  npsRate: number = 10;
  medicalDefault: number = 1000;
  gliDefault: number = 30;

  // ══════════════════════════════════════════════════════════════════
  // TEACHER MASTER STATE (School Staff Directory & Dropdown Source)
  // ══════════════════════════════════════════════════════════════════
  masterTeachers: MasterTeacher[] = [];
  isLoadingMasterTeachers = false;
  isSavingMasterTeacher = false;
  showTeacherMasterModal = false;
  isEditingMasterTeacher = false;
  editingTeacherId: string | null = null;
  manualTeacherRows: { [rowIndex: number]: boolean } = {};
  masterSearchTerm: string = '';

  teacherTypeOptions: string[] = ['HEAD MASTER', 'TRE-1', 'TRE-2', 'TRE-3', 'Regular', 'Niyojit', 'Other'];
  teacherClassOptions: string[] = ['1-5th', '6-8th', '9-10th', '11-12th', 'None'];

  teacherMasterForm: {
    teacherName: string;
    teacherType: string;
    teacherClass: string;
    pranNo: string;
    dob: string;
    teacherId: string;
    accountNo: string;
    basicPay: number;
    customFields: { key: string; value: string }[];
  } = {
    teacherName: '',
    teacherType: 'TRE-1',
    teacherClass: '11-12th',
    pranNo: '',
    dob: '',
    teacherId: '',
    accountNo: '',
    basicPay: 33880,
    customFields: []
  };

  // ══════════════════════════════════════════════════════════════════
  // PROFILE & SCHOOL ENDORSEMENT STATE (Headmaster Signature & Seal)
  // ══════════════════════════════════════════════════════════════════
  profileForm = {
    fullName: '',
    headmasterName: '',
    headmasterDesignation: 'Head Master (प्रधानाध्यापक)',
    headmasterSignatureUrl: '',
    schoolSealUrl: '',
    email: '',
    schoolName: '',
    udiseCode: '',
    mobileNo: ''
  };
  isSavingProfile = false;
  headmasterDesignations: string[] = [
    'Head Master (प्रधानाध्यापक)',
    'Head Teacher (प्रधान शिक्षक)',
    'Principal (प्राचार्य)',
    'Prabhari Head Master (प्रभारी प्रधानाध्यापक)',
    'In-charge Teacher (प्रभारी शिक्षक)'
  ];

  constructor(
    private authService: TeacherAuthService,
    private salaryService: SalarySlipService,
    private teacherMasterService: TeacherMasterService,
    private router: Router
  ) {}

  ngOnInit() {
    this.teacherData = this.authService.getTeacherData();
    if (!this.teacherData) {
      this.logout();
      return;
    }
    this.initProfileForm();
    this.loadDocuments();
    this.loadSalaryStatements();
    this.loadMasterTeachers();
  }

  // ─── TABS & UI ──────────────────────────────────────────────
  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'my-docs') {
      this.loadDocuments();
    } else if (tab === 'salary-slip') {
      this.loadSalaryStatements();
      this.loadMasterTeachers();
    } else if (tab === 'teacher-master') {
      this.loadMasterTeachers();
    } else if (tab === 'profile') {
      this.initProfileForm();
    }
  }

  showToast(msg: string, type: string = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = '', 4000);
  }

  // ══════════════════════════════════════════════════════════════════
  // SALARY SLIP / ABSENTEE STATEMENT METHODS
  // ══════════════════════════════════════════════════════════════════
  loadSalaryStatements() {
    this.isLoadingSalary = true;
    this.salaryService.getStatements(undefined, undefined, this.teacherData?.udiseCode).subscribe({
      next: (res) => {
        this.salaryStatements = res.statements || [];
        this.isLoadingSalary = false;
      },
      error: (err) => {
        this.isLoadingSalary = false;
        console.error('Failed to load salary statements', err);
      }
    });
  }

  // Create new statement with Bihar Government default 18 columns
  createNewStatement() {
    this.isLoadingSalary = true;
    this.salaryService.getDefaultConfig().subscribe({
      next: (config) => {
        const currentDate = new Date();
        const currentMonth = this.monthsList[currentDate.getMonth()];
        const currentYear = currentDate.getFullYear();

        this.currentStatement = {
          udiseCode: this.teacherData?.udiseCode || '',
          schoolName: this.teacherData?.schoolName || 'UHS MAHAMMADPUR MAJHAULIA',
          month: currentMonth,
          year: currentYear,
          title: 'अनुपस्थित एवं वेतन विवरणी',
          status: 'Draft',
          columns: JSON.parse(JSON.stringify(config.columns)),
          rows: [],
          totals: {},
          notes: ''
        };

        // Extract rates from default config
        if (config.rates) {
          this.daRate = config.rates.daRate || 63;
          this.hraRate = config.rates.hraRate || 5;
          this.npsRate = config.rates.npsRate || 10;
        }

        // Add 1 initial blank row
        this.addTeacherRow();
        this.salaryViewMode = 'editor';
        this.isLoadingSalary = false;
      },
      error: (err) => {
        this.isLoadingSalary = false;
        this.showToast('Failed to initialize salary statement template.', 'error');
      }
    });
  }

  // Open existing statement for editing
  editStatement(stmt: SalarySlipStatement) {
    this.currentStatement = JSON.parse(JSON.stringify(stmt));
    
    // Sync DA/HRA rates from columns if present
    const daCol = this.currentStatement?.columns.find(c => c.calculationType === 'da');
    if (daCol && daCol.rate) this.daRate = daCol.rate;
    const hraCol = this.currentStatement?.columns.find(c => c.calculationType === 'hra');
    if (hraCol && hraCol.rate) this.hraRate = hraCol.rate;

    this.recalculateAllRows();
    this.salaryViewMode = 'editor';
  }

  // View / Print statement
  viewPrintStatement(stmt: SalarySlipStatement) {
    this.currentStatement = JSON.parse(JSON.stringify(stmt));
    this.recalculateAllRows();
    this.salaryViewMode = 'print';
  }

  backToList() {
    this.salaryViewMode = 'list';
    this.currentStatement = null;
    this.loadSalaryStatements();
  }

  // Load all 9 sample teachers directly from the attached PDF with 1-click
  loadSamplePdfData() {
    if (!this.currentStatement) return;
    this.salaryService.getDefaultConfig().subscribe({
      next: (config) => {
        this.currentStatement!.columns = JSON.parse(JSON.stringify(config.columns));
        this.currentStatement!.rows = JSON.parse(JSON.stringify(config.sampleRows));
        this.currentStatement!.month = 'November';
        this.currentStatement!.year = 2026;
        if (!this.currentStatement!.schoolName || this.currentStatement!.schoolName === 'Government School') {
          this.currentStatement!.schoolName = 'UHS MAHAMMADPUR MAJHAULIA';
        }
        this.recalculateAllRows();
        this.showToast('Loaded 9 Bihar Government teacher records from PDF sample!', 'success');
      },
      error: () => this.showToast('Could not load sample data', 'error')
    });
  }

  // Import teachers from TeacherDirectory for this school
  importFromTeacherDirectory() {
    if (!this.currentStatement) return;
    this.salaryService.getTeachersForSchool(this.currentStatement.udiseCode).subscribe({
      next: (res) => {
        if (!res.teachers || res.teachers.length === 0) {
          this.showToast('No teacher directory records found for this UDISE code.', 'error');
          return;
        }

        const importedRows: TeacherSalaryRow[] = res.teachers.map((t, idx) => {
          const row: TeacherSalaryRow = {
            srNo: (this.currentStatement!.rows.length + idx + 1),
            teacherName: t.teacherName || '',
            pranNo: '',
            teacherType: 'TRE-1',
            teacherClass: t.class || '11-12th',
            dob: '',
            shikshakoshId: t.teacherId || '',
            accountNo: '',
            basicPay: 33880,
            gli: 30,
            itr: 0
          };
          return this.salaryService.recalculateRow(row, this.currentStatement!.columns);
        });

        this.currentStatement!.rows = [...this.currentStatement!.rows, ...importedRows];
        this.recalculateAllRows();
        this.showToast(`Imported ${importedRows.length} teacher(s) from directory!`, 'success');
      },
      error: () => this.showToast('Failed to fetch teachers from directory', 'error')
    });
  }

  // Add an empty teacher row
  addTeacherRow() {
    if (!this.currentStatement) return;
    const newSrNo = this.currentStatement.rows.length + 1;
    let newRow: TeacherSalaryRow = {
      srNo: newSrNo,
      teacherName: '',
      pranNo: '',
      teacherType: 'TRE-1',
      teacherClass: '11-12th',
      dob: '',
      shikshakoshId: '',
      accountNo: '',
      basicPay: 0,
      medical: this.medicalDefault,
      gli: this.gliDefault,
      itr: 0
    };

    newRow = this.salaryService.recalculateRow(newRow, this.currentStatement.columns);
    this.currentStatement.rows.push(newRow);
    this.recalculateAllTotals();
  }

  // Delete a teacher row
  deleteTeacherRow(index: number) {
    if (!this.currentStatement) return;
    if (this.currentStatement.rows.length <= 1) {
      this.showToast('At least one row is required in the absentee sheet.', 'error');
      return;
    }
    this.currentStatement.rows.splice(index, 1);
    // Re-index srNo
    this.currentStatement.rows.forEach((r, i) => r.srNo = i + 1);
    this.recalculateAllTotals();
  }

  // Called when any cell value changes (e.g. Basic Pay, DA, etc.)
  onCellChange(rowIndex: number, colKey: string) {
    if (!this.currentStatement) return;
    const row = this.currentStatement.rows[rowIndex];
    
    // Auto calculate row if basicPay or rate-dependent field changed
    const updated = this.salaryService.recalculateRow(row, this.currentStatement.columns);
    this.currentStatement.rows[rowIndex] = updated;
    this.recalculateAllTotals();
  }

  // Recalculate all rows
  recalculateAllRows() {
    if (!this.currentStatement) return;
    this.currentStatement.rows = this.currentStatement.rows.map((row, idx) => {
      row.srNo = idx + 1;
      return this.salaryService.recalculateRow(row, this.currentStatement!.columns);
    });
    this.recalculateAllTotals();
  }

  // Recalculate bottom totals
  recalculateAllTotals() {
    if (!this.currentStatement) return;
    this.currentStatement.totals = this.salaryService.recalculateTotals(
      this.currentStatement.columns, 
      this.currentStatement.rows
    );
  }

  // ─── DYNAMIC COLUMN MANAGEMENT (User requirement: Add/Update/Delete) ───
  openColumnManager() {
    this.showColumnManagerModal = true;
  }

  closeColumnManager() {
    this.showColumnManagerModal = false;
    // Apply changes (e.g., DA rate, HRA rate, labels)
    this.updateRatesInColumns();
    this.recalculateAllRows();
  }

  updateRatesInColumns() {
    if (!this.currentStatement) return;
    const daCol = this.currentStatement.columns.find(c => c.calculationType === 'da');
    if (daCol) {
      daCol.rate = this.daRate;
      daCol.label = `महंगाई भत्ता (${this.daRate}%)`;
    }

    const hraCol = this.currentStatement.columns.find(c => c.calculationType === 'hra');
    if (hraCol) {
      hraCol.rate = this.hraRate;
      hraCol.label = `आवास भत्ता (${this.hraRate}%)`;
    }
  }

  openAddColumnModal() {
    this.newCol = {
      label: '',
      type: 'text',
      category: 'info',
      defaultValue: ''
    };
    this.showAddColumnModal = true;
  }

  closeAddColumnModal() {
    this.showAddColumnModal = false;
  }

  saveNewColumn() {
    if (!this.newCol.label.trim()) {
      this.showToast('Column label is required.', 'error');
      return;
    }

    if (!this.currentStatement) return;

    // Generate unique key
    const sanitizedKey = this.newCol.label
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^_+|_+$/g, '') || `custom_${Date.now()}`;
    const uniqueKey = `${sanitizedKey}_${Date.now() % 10000}`;

    const newColumn: ColumnConfig = {
      id: `col_${Date.now()}`,
      key: uniqueKey,
      label: this.newCol.label.trim(),
      type: this.newCol.type,
      category: this.newCol.category,
      calculationType: 'none',
      isRemovable: true,
      defaultValue: this.newCol.defaultValue || null,
      order: this.currentStatement.columns.length + 1,
      width: '120px'
    };

    // If category is earning or deduction, it can participate in totals
    this.currentStatement.columns.push(newColumn);

    // Initialize in all rows
    this.currentStatement.rows.forEach(r => {
      r[newColumn.key] = this.newCol.defaultValue || (this.newCol.type === 'number' ? 0 : '');
    });

    this.recalculateAllRows();
    this.closeAddColumnModal();
    this.showToast(`Column "${newColumn.label}" added successfully!`, 'success');
  }

  deleteColumn(col: ColumnConfig) {
    if (!col.isRemovable) {
      this.showToast('This core column cannot be removed.', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete the column "${col.label}"?`)) return;

    if (!this.currentStatement) return;

    this.currentStatement.columns = this.currentStatement.columns.filter(c => c.id !== col.id);
    // Clean up property from rows
    this.currentStatement.rows.forEach(r => {
      delete r[col.key];
    });

    this.recalculateAllRows();
    this.showToast(`Column "${col.label}" deleted.`, 'success');
  }

  // ─── SAVE & SUBMIT STATEMENT ──────────────────────────────────────────
  saveStatement(submit: boolean = false) {
    if (!this.currentStatement) return;

    if (submit) {
      this.currentStatement.status = 'Submitted';
    }

    // Attach latest headmaster endorsement & seal
    if (!this.currentStatement.headmasterName) {
      this.currentStatement.headmasterName = this.teacherData?.headmasterName || this.teacherData?.fullName || '';
    }
    if (!this.currentStatement.headmasterDesignation) {
      this.currentStatement.headmasterDesignation = this.teacherData?.headmasterDesignation || 'Head Master (प्रधानाध्यापक)';
    }
    if (!this.currentStatement.headmasterSignatureUrl) {
      this.currentStatement.headmasterSignatureUrl = this.teacherData?.headmasterSignatureUrl || '';
    }
    if (!this.currentStatement.schoolSealUrl) {
      this.currentStatement.schoolSealUrl = this.teacherData?.schoolSealUrl || '';
    }

    this.isSavingSalary = true;
    this.recalculateAllRows();

    if (this.currentStatement._id) {
      // Update
      this.salaryService.updateStatement(this.currentStatement._id, this.currentStatement).subscribe({
        next: (res) => {
          this.isSavingSalary = false;
          this.currentStatement = res.statement;
          this.showToast(submit ? 'Statement submitted to BRC successfully!' : 'Statement draft saved successfully!');
          if (submit) this.backToList();
        },
        error: (err) => {
          this.isSavingSalary = false;
          this.showToast('Failed to update statement.', 'error');
        }
      });
    } else {
      // Create new
      this.salaryService.createStatement(this.currentStatement).subscribe({
        next: (res) => {
          this.isSavingSalary = false;
          this.currentStatement = res.statement;
          this.showToast(submit ? 'Statement submitted to BRC successfully!' : 'Statement created & saved successfully!');
          if (submit) this.backToList();
        },
        error: (err) => {
          this.isSavingSalary = false;
          this.showToast('Failed to create statement.', 'error');
        }
      });
    }
  }

  deleteStatement(id: string) {
    if (!confirm('Are you sure you want to delete this absentee statement?')) return;
    this.salaryService.deleteStatement(id).subscribe({
      next: () => {
        this.showToast('Statement deleted successfully');
        this.loadSalaryStatements();
      },
      error: () => this.showToast('Failed to delete statement', 'error')
    });
  }

  // Print Statement (Landscape Bihar Govt Sheet)
  printStatement() {
    window.print();
  }

  // ─── INDIVIDUAL TEACHER PAY SLIP MODAL ────────────────────────────────
  viewTeacherPaySlip(row: TeacherSalaryRow) {
    this.selectedTeacherSlip = row;
    this.showPaySlipModal = true;
  }

  closePaySlipModal() {
    this.showPaySlipModal = false;
    this.selectedTeacherSlip = null;
  }

  printTeacherPaySlip() {
    window.print();
  }

  getTotal(colKey: string): number {
    if (!this.currentStatement || !this.currentStatement.totals) return 0;
    return this.currentStatement.totals[colKey] || 0;
  }

  // Helpers
  formatCurrency(val: any): string {
    return this.salaryService.formatCurrency(val);
  }

  numberToWords(num: number | undefined): string {
    if (!num) return 'Zero Rupees Only';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      let str = '';
      if (n >= 10000000) {
        str += inWords(Math.floor(n / 10000000)) + 'Crore ';
        n %= 10000000;
      }
      if (n >= 100000) {
        str += inWords(Math.floor(n / 100000)) + 'Lakh ';
        n %= 100000;
      }
      if (n >= 1000) {
        str += inWords(Math.floor(n / 1000)) + 'Thousand ';
        n %= 1000;
      }
      if (n >= 100) {
        str += inWords(Math.floor(n / 100)) + 'Hundred ';
        n %= 100;
      }
      if (n > 0) {
        if (str !== '') str += 'and ';
        if (n < 20) str += a[n];
        else {
          str += b[Math.floor(n / 10)];
          if (n % 10 > 0) str += ' ' + a[n % 10];
        }
      }
      return str;
    };

    return inWords(Math.round(num)).trim() + ' Rupees Only';
  }

  // ══════════════════════════════════════════════════════════════════
  // TEACHER MASTER MANAGEMENT (Staff Registry & Dynamic Fields)
  // ══════════════════════════════════════════════════════════════════
  loadMasterTeachers() {
    this.isLoadingMasterTeachers = true;
    const udise = this.teacherData?.udiseCode || '';
    const schoolName = this.teacherData?.schoolName || '';
    this.teacherMasterService.getTeachers(udise, schoolName).subscribe({
      next: (res) => {
        this.masterTeachers = res.data || [];
        this.isLoadingMasterTeachers = false;
      },
      error: (err) => {
        this.isLoadingMasterTeachers = false;
        console.error('Failed to load master teachers:', err);
      }
    });
  }

  getFilteredMasterTeachers(): MasterTeacher[] {
    if (!this.masterSearchTerm || !this.masterSearchTerm.trim()) {
      return this.masterTeachers;
    }
    const q = this.masterSearchTerm.toLowerCase().trim();
    return this.masterTeachers.filter(t => 
      (t.teacherName && t.teacherName.toLowerCase().includes(q)) ||
      (t.teacherType && t.teacherType.toLowerCase().includes(q)) ||
      (t.pranNo && t.pranNo.toLowerCase().includes(q)) ||
      (t.teacherId && t.teacherId.toLowerCase().includes(q)) ||
      (t.accountNo && t.accountNo.toLowerCase().includes(q))
    );
  }

  getTotalMasterBasic(): number {
    return this.masterTeachers.reduce((sum, t) => sum + (Number(t.basicPay) || 0), 0);
  }

  openAddMasterTeacherModal() {
    this.isEditingMasterTeacher = false;
    this.editingTeacherId = null;
    this.teacherMasterForm = {
      teacherName: '',
      teacherType: 'TRE-1',
      teacherClass: '11-12th',
      pranNo: '',
      dob: '',
      teacherId: '',
      accountNo: '',
      basicPay: 33880,
      customFields: []
    };
    this.showTeacherMasterModal = true;
  }

  openEditMasterTeacherModal(t: MasterTeacher) {
    this.isEditingMasterTeacher = true;
    this.editingTeacherId = t._id || null;
    const customList: { key: string; value: string }[] = [];
    if (t.customFields) {
      Object.keys(t.customFields).forEach(k => {
        customList.push({ key: k, value: String(t.customFields![k]) });
      });
    }
    this.teacherMasterForm = {
      teacherName: t.teacherName || '',
      teacherType: t.teacherType || 'TRE-1',
      teacherClass: t.teacherClass || '11-12th',
      pranNo: t.pranNo || '',
      dob: t.dob || '',
      teacherId: t.teacherId || '',
      accountNo: t.accountNo || '',
      basicPay: t.basicPay || 0,
      customFields: customList
    };
    this.showTeacherMasterModal = true;
  }

  closeMasterTeacherModal() {
    this.showTeacherMasterModal = false;
    this.editingTeacherId = null;
  }

  addCustomFieldToTeacherForm() {
    this.teacherMasterForm.customFields.push({ key: '', value: '' });
  }

  removeCustomFieldFromTeacherForm(idx: number) {
    this.teacherMasterForm.customFields.splice(idx, 1);
  }

  saveMasterTeacher() {
    if (!this.teacherMasterForm.teacherName.trim()) {
      this.showToast('Teacher name is required.', 'error');
      return;
    }

    const customFieldsObj: Record<string, any> = {};
    this.teacherMasterForm.customFields.forEach(f => {
      if (f.key && f.key.trim()) {
        customFieldsObj[f.key.trim()] = f.value;
      }
    });

    const payload: Partial<MasterTeacher> = {
      udiseCode: this.teacherData?.udiseCode || '',
      schoolName: this.teacherData?.schoolName || '',
      teacherName: this.teacherMasterForm.teacherName.trim(),
      teacherType: this.teacherMasterForm.teacherType,
      teacherClass: this.teacherMasterForm.teacherClass,
      pranNo: this.teacherMasterForm.pranNo.trim(),
      dob: this.teacherMasterForm.dob.trim(),
      teacherId: this.teacherMasterForm.teacherId.trim(),
      accountNo: this.teacherMasterForm.accountNo.trim(),
      basicPay: Number(this.teacherMasterForm.basicPay) || 0,
      customFields: customFieldsObj
    };

    this.isSavingMasterTeacher = true;

    if (this.isEditingMasterTeacher && this.editingTeacherId) {
      this.teacherMasterService.updateTeacher(this.editingTeacherId, payload).subscribe({
        next: () => {
          this.isSavingMasterTeacher = false;
          this.showToast('Teacher updated in Master successfully!', 'success');
          this.closeMasterTeacherModal();
          this.loadMasterTeachers();
        },
        error: (err) => {
          this.isSavingMasterTeacher = false;
          this.showToast(err.error?.message || 'Failed to update teacher.', 'error');
        }
      });
    } else {
      this.teacherMasterService.addTeacher(payload).subscribe({
        next: () => {
          this.isSavingMasterTeacher = false;
          this.showToast('New teacher added to Master successfully!', 'success');
          this.closeMasterTeacherModal();
          this.loadMasterTeachers();
        },
        error: (err) => {
          this.isSavingMasterTeacher = false;
          this.showToast(err.error?.message || 'Failed to add teacher.', 'error');
        }
      });
    }
  }

  deleteMasterTeacher(t: MasterTeacher) {
    if (!t._id) return;
    if (!confirm(`Are you sure you want to remove "${t.teacherName}" from Master?`)) {
      return;
    }

    this.teacherMasterService.deleteTeacher(t._id).subscribe({
      next: () => {
        this.showToast(`Removed "${t.teacherName}" from Master.`, 'success');
        this.loadMasterTeachers();
      },
      error: () => this.showToast('Failed to delete teacher from Master.', 'error')
    });
  }

  seedMasterTeachersFromPdf() {
    if (!confirm('This will load/reset the 9 sample teachers from the Bihar Govt PDF into your Teacher Master. Continue?')) {
      return;
    }
    this.isLoadingMasterTeachers = true;
    this.teacherMasterService.seedSampleTeachers(true).subscribe({
      next: (res) => {
        this.isLoadingMasterTeachers = false;
        this.masterTeachers = res.data || [];
        this.showToast('Successfully loaded 9 Bihar Government sample teachers into Master!', 'success');
      },
      error: () => {
        this.isLoadingMasterTeachers = false;
        this.showToast('Failed to seed teachers', 'error');
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ABSENTEE SHEET: DROPDOWN & POPULATE FROM MASTER METHODS
  // ══════════════════════════════════════════════════════════════════
  getTeacherMasterIdByName(name: string | undefined): string {
    if (!name || !name.trim()) return '';
    const found = this.masterTeachers.find(
      t => t.teacherName.trim().toLowerCase() === name.trim().toLowerCase()
    );
    return found ? (found._id || '') : '__MANUAL__';
  }

  isManualTeacherName(rowIndex: number, name?: string): boolean {
    if (this.manualTeacherRows[rowIndex]) return true;
    if (!name || !name.trim()) return false;
    const found = this.masterTeachers.find(
      t => t.teacherName.trim().toLowerCase() === name.trim().toLowerCase()
    );
    return !found;
  }

  onSelectMasterTeacher(rowIndex: number, selectedId: string) {
    if (!this.currentStatement) return;
    const row = this.currentStatement.rows[rowIndex];
    if (!row) return;

    if (selectedId === '__MANUAL__') {
      this.manualTeacherRows[rowIndex] = true;
      return;
    }

    if (!selectedId) {
      this.manualTeacherRows[rowIndex] = false;
      return;
    }

    const tm = this.masterTeachers.find(t => t._id === selectedId);
    if (tm) {
      this.manualTeacherRows[rowIndex] = false;
      row.teacherName = tm.teacherName;
      row.pranNo = tm.pranNo || '';
      row.teacherType = tm.teacherType || 'TRE-1';
      row.teacherClass = tm.teacherClass || '';
      row.dob = tm.dob || '';
      row.shikshakoshId = tm.teacherId || '';
      row.accountNo = tm.accountNo || '';
      row.basicPay = tm.basicPay || 0;

      // Sync any matching dynamic custom attributes into row
      if (tm.customFields) {
        Object.keys(tm.customFields).forEach(key => {
          row[key] = tm.customFields![key];
        });
      }

      this.onCellChange(rowIndex, 'basicPay');
      this.showToast(`Selected: ${tm.teacherName} (${tm.teacherType} - Basic: ₹${this.formatCurrency(tm.basicPay)})`, 'success');
    }
  }

  populateAllFromMaster() {
    if (!this.currentStatement) return;
    if (!this.masterTeachers || this.masterTeachers.length === 0) {
      this.showToast('No teachers found in Master. Please add teachers or seed sample data.', 'error');
      return;
    }

    const hasData = this.currentStatement.rows.length > 0 && !!this.currentStatement.rows[0].teacherName;
    if (hasData) {
      if (!confirm(`Populate sheet with all ${this.masterTeachers.length} teachers from Teacher Master? Current rows will be replaced.`)) {
        return;
      }
    }

    this.currentStatement.rows = this.masterTeachers.map((tm, idx) => {
      const row: TeacherSalaryRow = {
        srNo: idx + 1,
        teacherName: tm.teacherName,
        pranNo: tm.pranNo || '',
        teacherType: tm.teacherType || 'TRE-1',
        teacherClass: tm.teacherClass || '',
        dob: tm.dob || '',
        shikshakoshId: tm.teacherId || '',
        accountNo: tm.accountNo || '',
        basicPay: tm.basicPay || 0,
        medical: this.medicalDefault,
        gli: this.gliDefault,
        itr: 0
      };

      if (tm.customFields) {
        Object.keys(tm.customFields).forEach(key => {
          row[key] = tm.customFields![key];
        });
      }

      return this.salaryService.recalculateRow(row, this.currentStatement!.columns);
    });

    this.manualTeacherRows = {};
    this.recalculateAllTotals();
    this.showToast(`Populated all ${this.masterTeachers.length} teachers from Master successfully!`, 'success');
  }

  // ─── UPLOAD DOCUMENT (ORIGINAL FEATURES PRESERVED) ──────────────────────
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('File size must be less than 5MB', 'error');
        this.fileInput.nativeElement.value = '';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    }
  }

  onUpload() {
    if (!this.uploadTitle || !this.selectedFile) {
      this.showToast('Title and file are required.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.uploadTitle);
    formData.append('docType', this.uploadType);
    formData.append('description', this.uploadDesc);
    formData.append('file', this.selectedFile);

    this.isUploading = true;
    this.authService.uploadDocument(formData).subscribe({
      next: () => {
        this.isUploading = false;
        this.showToast('Document uploaded successfully!');
        this.resetUploadForm();
        this.loadDocuments();
      },
      error: (err) => {
        this.isUploading = false;
        this.showToast(err.error?.message || 'Upload failed.', 'error');
      }
    });
  }

  resetUploadForm() {
    this.uploadTitle = '';
    this.uploadType = 'Letter';
    this.uploadDesc = '';
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  loadDocuments() {
    this.isLoading = true;
    this.authService.getMyDocuments().subscribe({
      next: (res) => {
        this.documents = res.documents;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load documents', err);
      }
    });
  }

  getDocumentUrl(id: string): string {
    return getFullUrl(`/teacher-docs/${id}/document`);
  }

  deleteDocument(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    this.authService.deleteDocument(id).subscribe({
      next: () => {
        this.showToast('Document deleted successfully');
        this.documents = this.documents.filter(d => d._id !== id);
      },
      error: () => {
        this.showToast('Failed to delete document', 'error');
      }
    });
  }

  // ─── PROFILE & ENDORSEMENT MANAGEMENT ───────────────────────────
  initProfileForm() {
    if (!this.teacherData) {
      this.teacherData = this.authService.getTeacherData() || {};
    }
    this.profileForm = {
      fullName: this.teacherData?.fullName || '',
      headmasterName: this.teacherData?.headmasterName || this.teacherData?.fullName || '',
      headmasterDesignation: this.teacherData?.headmasterDesignation || 'Head Master (प्रधानाध्यापक)',
      headmasterSignatureUrl: this.teacherData?.headmasterSignatureUrl || '',
      schoolSealUrl: this.teacherData?.schoolSealUrl || '',
      email: this.teacherData?.email || '',
      schoolName: this.teacherData?.schoolName || '',
      udiseCode: this.teacherData?.udiseCode || '',
      mobileNo: this.teacherData?.mobileNo || ''
    };

    // Also fetch fresh from server to ensure latest saved signature/seal
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res.teacher) {
          this.teacherData = { ...this.teacherData, ...res.teacher };
          this.authService.saveTeacherData(this.teacherData);
          this.profileForm = {
            fullName: this.teacherData.fullName || '',
            headmasterName: this.teacherData.headmasterName || this.teacherData.fullName || '',
            headmasterDesignation: this.teacherData.headmasterDesignation || 'Head Master (प्रधानाध्यापक)',
            headmasterSignatureUrl: this.teacherData.headmasterSignatureUrl || '',
            schoolSealUrl: this.teacherData.schoolSealUrl || '',
            email: this.teacherData.email || '',
            schoolName: this.teacherData.schoolName || '',
            udiseCode: this.teacherData.udiseCode || '',
            mobileNo: this.teacherData.mobileNo || ''
          };
        }
      },
      error: () => {}
    });
  }

  compressImage(file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.88): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent: any) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            resolve(canvas.toDataURL(mimeType, quality));
          } else {
            resolve(readerEvent.target.result);
          }
        };
        img.onerror = () => resolve(readerEvent.target.result);
        img.src = readerEvent.target.result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async onSignatureFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.showToast('Signature file size must be less than 10MB', 'error');
        return;
      }
      try {
        const compressed = await this.compressImage(file, 800, 400, 0.9);
        this.profileForm.headmasterSignatureUrl = compressed;
      } catch (e) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.profileForm.headmasterSignatureUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  async onSealFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.showToast('School seal file size must be less than 10MB', 'error');
        return;
      }
      try {
        const compressed = await this.compressImage(file, 600, 600, 0.9);
        this.profileForm.schoolSealUrl = compressed;
      } catch (e) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.profileForm.schoolSealUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeSignature() {
    this.profileForm.headmasterSignatureUrl = '';
  }

  removeSeal() {
    this.profileForm.schoolSealUrl = '';
  }

  saveProfile() {
    this.isSavingProfile = true;
    this.authService.updateProfile(this.profileForm).subscribe({
      next: (res) => {
        this.isSavingProfile = false;
        if (res.teacher) {
          this.teacherData = { ...this.teacherData, ...res.teacher };
          this.authService.saveTeacherData(this.teacherData);
          if (this.currentStatement) {
            this.currentStatement.headmasterName = this.teacherData.headmasterName;
            this.currentStatement.headmasterDesignation = this.teacherData.headmasterDesignation;
            this.currentStatement.headmasterSignatureUrl = this.teacherData.headmasterSignatureUrl;
            this.currentStatement.schoolSealUrl = this.teacherData.schoolSealUrl;
          }
        }
        this.showToast('School Headmaster profile, signature & seal saved successfully!', 'success');
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.showToast(err.error?.message || 'Failed to update profile.', 'error');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/teacher/login']);
  }
}
