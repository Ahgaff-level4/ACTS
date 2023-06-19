import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, catchError } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { CustomTimeframe, IChildReport, IDashboard, Timeframe } from '../../../../interfaces';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  public URL = env.API + 'report/';

  constructor(private http: HttpClient, private nt:NotificationService) {
  }

  fetchChildReport(childId: number, timeframe?: CustomTimeframe): Observable<IChildReport> {
    return this.http.get<IChildReport>(this.URL + 'child/' + childId, {
      params: timeframe as {from:string,to:string}|undefined
    }).pipe(
      catchError(e => { this.nt.errorDefaultDialog(e); return EMPTY; })
    );
  }

  fetchDashboard(query?: { timeframe: Timeframe }): Observable<IDashboard> {
    return this.http.get<IDashboard>(this.URL + 'dashboard', { params: query }).pipe(
      catchError(e => { this.nt.errorDefaultDialog(e); return EMPTY; })
    );
  }


}

