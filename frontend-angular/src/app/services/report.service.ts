import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,catchError} from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { IChildReport } from '../../../../interfaces';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  public URL = env.API + 'report/';

  constructor(private http: HttpClient, private ut:UtilityService) {
  }

  fetchChildReport(childId:number):Observable<IChildReport>{
    return this.http.get<IChildReport>(this.URL+'child/'+childId).pipe(
      catchError(e=>this.ut.errorDefaultDialog(e).afterClosed())
    );
  }


}
