import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { ICreateProgram, IProgramEntity, SucResEditDel } from '../../../../interfaces';
import { environment as env } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {

  public programs = new ReplaySubject<IProgramEntity[]>(1);
  public URL = env.API + 'program';

  constructor(private http: HttpClient, private ut: UtilityService) {
    this.fetch();
  }

  /** fetch programs from DB and emit it to programs */
  public fetch(manageLoading = false): Promise<void> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IProgramEntity[]>(this.URL)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.programs.next(v); res()
          }, error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, 'Sorry, there was a problem fetching the programs. Please try again later or check your connection.'); rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);rej()}
        });
    })
  }

  /**
 * @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
 */
  post(field: ICreateProgram, manageLoading = false): Promise<IProgramEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IProgramEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.fetch();
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the program. Please try again later or check your connection.");
            rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);rej()}
        })
    });
  }

  patch(id: number, child: Partial<IProgramEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.URL + '/' + id, child)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.fetch(); res(v)
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the program. Please try again later or check your connection.");
            rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);rej()}
        })
    })
  }

  delete(id: number, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.delete<SucResEditDel>(this.URL + '/' + id)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.fetch(); res(v)
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the program. Please try again later or check your connection."); rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);rej()}
        })
    })
  }


}
