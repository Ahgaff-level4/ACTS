import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ICreateProgram, IProgramEntity, SucResEditDel } from '../../../../interfaces';
import { environment as env } from 'src/environment';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  public programs = new BehaviorSubject<IProgramEntity[]>([]);
  public URL = env.API + 'program';

  constructor(private http: HttpClient, private ut: UtilityService) {
  }

  /** fetch programs from DB and emit it to programs */
  fetch(): Promise<void> {
    return new Promise((res, rej) => {
      this.http.get<IProgramEntity[]>(this.URL)
        .subscribe({ next: (v) => { this.programs.next(v); res() }, error: (e) => { this.ut.errorDefaultDialog(e, 'Sorry, there was a problem fetching the programs. Please try again later or check your connection.'); rej(e); } });
    })
  }

  /**
 * @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
 */
  post(field: ICreateProgram): Promise<IProgramEntity> {
    return new Promise((res, rej) => {
      this.http.post<IProgramEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the program. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  patch(id: number, child: Partial<IProgramEntity>): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      this.http.patch<SucResEditDel>(this.URL + '/' + id, child)
        .subscribe({
          next: (v) => { this.fetch(); res(v) },
          error: e => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the program. Please try again later or check your connection.");
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
          error: (e) => { this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the program. Please try again later or check your connection."); rej(e); }
        })
    })
  }
}
