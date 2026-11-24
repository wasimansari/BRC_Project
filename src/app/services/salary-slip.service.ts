import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getFullUrl } from '../core/constants/api-endpoints';

export interface ColumnConfig {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'calculated';
  category: 'info' | 'earning' | 'deduction' | 'summary' | 'other';
  calculationType: 'none' | 'srNo' | 'da' | 'hra' | 'medical' | 'gross' | 'nps' | 'totalDeduction' | 'netPayment' | 'custom';
  rate?: number | null; // e.g. 63 for DA, 5 for HRA, 10 for NPS
  defaultValue?: any;
  isRemovable?: boolean;
  order: number;
  width?: string;
}

export interface TeacherSalaryRow {
  srNo?: number;
  teacherName?: string;
  pranNo?: string;
  teacherType?: string;
  teacherClass?: string;
  dob?: string;
  shikshakoshId?: string;
  accountNo?: string;
  basicPay?: number;
  da?: number;
  hra?: number;
  medical?: number;
  grossSalary?: number;
  gpfNps?: number;
  gli?: number;
  itr?: number;
  totalDeduction?: number;
  netPayment?: number;
  [key: string]: any; // Allow dynamic column keys
}

export interface SalarySlipTotals {
  basicPay?: number;
  da?: number;
  hra?: number;
  medical?: number;
  grossSalary?: number;
  gpfNps?: number;
  gli?: number;
  itr?: number;
  totalDeduction?: number;
  netPayment?: number;
  [key: string]: number | undefined;
}

export interface SalarySlipStatement {
  _id?: string;
  udiseCode: string;
  schoolName: string;
  month: string;
  year: number;
  title?: string;
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  columns: ColumnConfig[];
  rows: TeacherSalaryRow[];
  totals?: SalarySlipTotals;
  notes?: string;
  headmasterName?: string;
  headmasterDesignation?: string;
  headmasterSignatureUrl?: string;
  schoolSealUrl?: string;
  creatorName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class SalarySlipService {
  private readonly API_URL = getFullUrl('/salary-slip');

  constructor(private http: HttpClient) {}

  getDefaultConfig(): Observable<{ columns: ColumnConfig[]; sampleRows: TeacherSalaryRow[]; rates: any }> {
    return this.http.get<{ columns: ColumnConfig[]; sampleRows: TeacherSalaryRow[]; rates: any }>(
      `${this.API_URL}/default-config`
    );
  }

  getStatements(month?: string, year?: number, udiseCode?: string): Observable<{ success: boolean; count: number; statements: SalarySlipStatement[] }> {
    let params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (udiseCode) params.udiseCode = udiseCode;
    return this.http.get<{ success: boolean; count: number; statements: SalarySlipStatement[] }>(
      this.API_URL, 
      { params }
    );
  }

  getStatement(id: string): Observable<{ success: boolean; statement: SalarySlipStatement }> {
    return this.http.get<{ success: boolean; statement: SalarySlipStatement }>(`${this.API_URL}/${id}`);
  }

  getTeachersForSchool(udiseCode?: string): Observable<{ success: boolean; teachers: any[] }> {
    let params: any = {};
    if (udiseCode) params.udiseCode = udiseCode;
    return this.http.get<{ success: boolean; teachers: any[] }>(`${this.API_URL}/teachers-for-school`, { params });
  }

  createStatement(data: Partial<SalarySlipStatement>): Observable<{ success: boolean; message: string; statement: SalarySlipStatement }> {
    return this.http.post<{ success: boolean; message: string; statement: SalarySlipStatement }>(
      this.API_URL, 
      data
    );
  }

  updateStatement(id: string, data: Partial<SalarySlipStatement>): Observable<{ success: boolean; message: string; statement: SalarySlipStatement }> {
    return this.http.put<{ success: boolean; message: string; statement: SalarySlipStatement }>(
      `${this.API_URL}/${id}`, 
      data
    );
  }

  deleteStatement(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`);
  }

  // ─── CLIENT CALCULATION ENGINE ──────────────────────────────────────
  recalculateRow(row: TeacherSalaryRow, columns: ColumnConfig[]): TeacherSalaryRow {
    const updated = { ...row };
    const basic = parseFloat(updated.basicPay as any) || 0;

    // Find DA column
    const daCol = columns.find(c => c.calculationType === 'da');
    const daRate = daCol?.rate !== undefined && daCol.rate !== null ? daCol.rate : 63;
    if (daCol) {
      updated[daCol.key] = Math.round((basic * daRate) / 100);
    }

    // Find HRA column
    const hraCol = columns.find(c => c.calculationType === 'hra');
    const hraRate = hraCol?.rate !== undefined && hraCol.rate !== null ? hraCol.rate : 5;
    if (hraCol) {
      updated[hraCol.key] = Math.round((basic * hraRate) / 100);
    }

    // Find Medical column
    const medCol = columns.find(c => c.calculationType === 'medical');
    if (medCol && (updated[medCol.key] === undefined || updated[medCol.key] === null || (updated[medCol.key] as any) === '')) {
      updated[medCol.key] = medCol.defaultValue !== undefined ? medCol.defaultValue : 1000;
    }

    // Calculate Gross Salary: sum of all earning columns
    const grossCol = columns.find(c => c.calculationType === 'gross');
    if (grossCol) {
      let grossSum = 0;
      columns.forEach(col => {
        if (col.category === 'earning' || col.key === 'basicPay') {
          grossSum += parseFloat(updated[col.key] as any) || 0;
        }
      });
      updated[grossCol.key] = Math.round(grossSum);
    }

    // Calculate GPF / NPS Deduction: 10% of (Basic Pay + DA)
    const npsCol = columns.find(c => c.calculationType === 'nps');
    if (npsCol) {
      const daVal = daCol ? (parseFloat(updated[daCol.key] as any) || 0) : 0;
      const npsRate = npsCol.rate !== undefined && npsCol.rate !== null ? npsCol.rate : 10;
      updated[npsCol.key] = Math.round(((basic + daVal) * npsRate) / 100);
    }

    // Ensure GLI and ITR defaults if not set
    const gliCol = columns.find(c => c.key === 'gli');
    if (gliCol && (updated['gli'] === undefined || updated['gli'] === null || (updated['gli'] as any) === '')) {
      updated['gli'] = gliCol.defaultValue !== undefined ? gliCol.defaultValue : 30;
    }
    const itrCol = columns.find(c => c.key === 'itr');
    if (itrCol && (updated['itr'] === undefined || updated['itr'] === null || (updated['itr'] as any) === '')) {
      updated['itr'] = itrCol.defaultValue !== undefined ? itrCol.defaultValue : 0;
    }

    // Calculate Total Deductions: sum of all deduction columns
    const totalDedCol = columns.find(c => c.calculationType === 'totalDeduction');
    if (totalDedCol) {
      let dedSum = 0;
      columns.forEach(col => {
        if (col.category === 'deduction') {
          dedSum += parseFloat(updated[col.key] as any) || 0;
        }
      });
      updated[totalDedCol.key] = Math.round(dedSum);
    }

    // Calculate Net Payment: Gross - Total Deduction
    const netCol = columns.find(c => c.calculationType === 'netPayment');
    if (netCol) {
      const gross = grossCol ? (parseFloat(updated[grossCol.key] as any) || 0) : 0;
      const ded = totalDedCol ? (parseFloat(updated[totalDedCol.key] as any) || 0) : 0;
      updated[netCol.key] = Math.round(gross - ded);
    }

    return updated;
  }

  recalculateTotals(columns: ColumnConfig[], rows: TeacherSalaryRow[]): SalarySlipTotals {
    const totals: SalarySlipTotals = {};
    if (!rows || rows.length === 0) return totals;

    columns.forEach(col => {
      if (col.type === 'number' && col.calculationType !== 'srNo') {
        const sum = rows.reduce((acc, row) => {
          const val = parseFloat(row[col.key] as any) || 0;
          return acc + val;
        }, 0);
        totals[col.key] = Math.round(sum);
      }
    });

    return totals;
  }

  // Format currency with Indian grouping: e.g. 3,04,620
  formatCurrency(value: number | string | undefined | null): string {
    if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
      return '0';
    }
    const num = Math.round(Number(value));
    return num.toLocaleString('en-IN');
  }
}
