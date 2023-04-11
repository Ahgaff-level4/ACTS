import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'
import { ICreateField, IFieldEntity, SucResEditDel } from '../../../../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment as env } from 'src/environment';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  public fields = new BehaviorSubject<IFieldEntity[]>([]);
  public URL = env.API + 'field';

  constructor(private http: HttpClient, private ut: UtilityService) {
  }

  /** fetch fields from DB and emit it to fields */
  fetch(): Promise<void> {
    return new Promise((res, rej) => {
      this.http.get<IFieldEntity[]>(this.URL)
        .subscribe({ next: (v) => { this.fields.next(v); res() }, error: (e) => { this.ut.errorDefaultDialog(e,"Sorry, there was a problem fetching the fields. Please try again later or check your connection."); rej(e); } });
    })
  }

  /**
 * @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
 */
  post(field: ICreateField): Promise<IFieldEntity> {
    return new Promise((res, rej) => {
      this.http.post<IFieldEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the field. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  patch(id: number, field: Partial<IFieldEntity>): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      this.http.patch<SucResEditDel>(this.URL + '/' + id, field)
        .subscribe({
          next: (v) => { this.fetch(); res(v) },
          error: e => {
            this.ut.errorDefaultDialog(e,"Sorry, there was a problem editing the field. Please try again later or check your connection.");
            rej(e);
          }
        })
    })
  }

  delete(id: number): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      this.http.delete<SucResEditDel>(this.URL + '/' + id)
        .subscribe({
          next: (v) => { this.fetch(); res(v) },
          error: (e) => { this.ut.errorDefaultDialog(e,"Sorry, there was a problem deleting the field. Please try again later or check your connection."); rej(e); }
        })
    })
  }
}
