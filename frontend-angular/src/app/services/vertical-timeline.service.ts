import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ITimelineEvent } from '../../../../interfaces';
@Injectable({
  providedIn: 'root'
})
export class VerticalTimelineService {

  constructor(private http: HttpClient) { }

  public fetch(state: 'child' | 'teacher' | 'parent', id: number) {
    return this.http.get<ITimelineEvent[]>(environment.API + 'timeline', { params: { state, id } });
  }
}
