import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { app_constants } from '../../constant';

export interface DashboardStats {
  totalSchools: number;
  totalTeachers: number;
  schools1to5: number;
  schools1to8: number;
  schools9to12: number;
  schools6to12: number;
  pendingTeacherRequests: number;
  allTrainingsCount: number;
  totalNewsCount: number;
}

export interface DashboardOverviewResponse {
  success: boolean;
  stats: DashboardStats;
  runningTrainings: any[];
  allTrainings: any[];
  latestNews: any[];
  pendingRequestsList: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${app_constants.baseUrl}/dashboard/overview`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<DashboardOverviewResponse> {
    return this.http.get<DashboardOverviewResponse>(this.API_URL);
  }
}

