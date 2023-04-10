import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environment';
import { ICreatePerson, SucResEditDel, IPersonEntity } from '../../../../interfaces';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  public personURL = env.API + 'person';

  constructor(private http: HttpClient, private ut: UtilityService) { }

  postPerson(person: ICreatePerson): Promise<IPersonEntity> {
    return new Promise((res, rej) => {
      this.http.post<IPersonEntity>(this.personURL, person)
        .subscribe({
          next: (v) => res(v),
          error: (e) => {
            this.ut.errorDefaultDialog(e);
            rej(e);
          }
        });
    });
  }

  patchPerson(id:number, person: Partial<ICreatePerson>): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      this.http.patch<SucResEditDel>(this.personURL + '/' + id, person)
        .subscribe({
          next: (v) => res(v),
          error: (e) => {
            this.ut.errorDefaultDialog(e);
            rej(e);
          }
        })
    })
  }


  deletePerson(id: number, doNotShowDialogs?: boolean): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      this.http.delete<SucResEditDel>(this.personURL + '/' + id)
        .subscribe({
          next: (v) => res(v),
          error: (e) => {
            if (!doNotShowDialogs)
              this.ut.errorDefaultDialog(e);
            rej(e);
          }
        })
    })
  }
}
