import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IChildEntity } from '../../../../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment as env } from 'src/environment';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class ChildrenService {
  constructor(private http:HttpClient,private ut:UtilityService) {
    this.children.subscribe(console.log);
    this.fetchChildren();
  }
  public children = new BehaviorSubject<IChildEntity[]>([]);
  fetchChildren=():void=>{
    this.http.get<IChildEntity[]>(env.API+'child',{params:{'FK':true}})
    .subscribe({next:(v)=>this.children.next(v),error:this.ut.errorDefaultDialog});
  }
}
