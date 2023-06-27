import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError, map } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { CustomTimeframe, IChildReport, IDashboard, TimeframeDuration } from '../../../../interfaces';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  public URL = env.API + 'report/';

  constructor(private http: HttpClient, private nt: NotificationService) {
  }

  fetchChildReport(childId: number, timeframe?: CustomTimeframe): Observable<IChildReport> {
    return this.http.get<IChildReport>(this.URL + 'child/' + childId, {
      params: timeframe as { from: string, to: string } | undefined
    }).pipe(
      catchError(e => { this.nt.errorDefaultDialog(e); return EMPTY; }),
    );
  }

  fetchDashboard(timeframe: CustomTimeframe): Observable<IDashboard> {
    return this.http.get<IDashboard>(this.URL + 'dashboard', { params: timeframe as { from: string, to: string } }).pipe(
      catchError(e => { this.nt.errorDefaultDialog(e); return EMPTY; })
    );
  }


}

