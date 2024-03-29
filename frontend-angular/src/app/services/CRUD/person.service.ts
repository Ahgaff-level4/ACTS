import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { ICreatePerson, SucResEditDel, IPersonEntity } from '../../../../../interfaces';
import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  public personURL = env.API + 'person';

  constructor(private http: HttpClient, private nt:NotificationService,) { }

  postPerson(person: FormData): Promise<IPersonEntity> {
    return new Promise((res, rej) => {
      this.http.post<IPersonEntity>(this.personURL, person)
        .subscribe({
          next: (v) => res(v),
          error: (e) => {
            this.nt.errorDefaultDialog(e);
            rej(e);
          },
        });
    });
  }

  patchPerson(id:number, person: FormData): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      this.http.patch<SucResEditDel>(this.personURL + '/' + id, person)
        .subscribe({
          next: (v) => res(v),
          error: (e) => {
            this.nt.errorDefaultDialog(e);
            rej(e);
          },
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
              this.nt.errorDefaultDialog(e);
            rej(e);
          },
        })
    })
  }
}
