import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ITimelineEvent } from '../../../../interfaces';
@Injectable({
  providedIn: 'root'
})
export class VerticalTimelineService {

  constructor(private http: HttpClient) { }

  public fetch(state: 'child' | 'account', id: number, take: number, skip: number) {
    return this.http.get<ITimelineEvent[]>(environment.API + 'timeline', { params: { state, id, take, skip } });
  }
}
