import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environment';
import { ICreatePerson, IPersonEntity } from '../../../../interfaces';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  public personURL = env.API + 'person';

  constructor(private http: HttpClient,private ut:UtilityService) { }

  postPerson(person:ICreatePerson):Promise<IPersonEntity>{
    return new Promise((res,rej)=>{
      this.http.post<IPersonEntity>(this.personURL,person)
      .subscribe({
        next:(v)=>res(v),
        error:(e)=>{
          this.ut.errorDefaultDialog(e);
          rej(e);
        }
      });
    });
    }
}
