import { Injectable } from '@angular/core';
import { IActivityEntity, ICreateActivity, SucResEditDel } from '../../../../interfaces';
import { environment as env } from 'src/environment';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './utility.service';
@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  URL = env.API + 'activity';
  //there is no activities subjectBehavior because activities are only fetched by a program using ProgramService.fetchOne(id:number) method
  constructor(private http: HttpClient, private ut: UtilityService) { }
  /**
* @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
* don't forget refresh after adding
*/
  post(field: ICreateActivity, manageLoading = false): Promise<IActivityEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IActivityEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false)
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the program. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  /** don't forget refresh after editing */
  patch(id: number, child: Partial<IActivityEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true)
      this.http.patch<SucResEditDel>(this.URL + '/' + id, child)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            res(v);
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the program. Please try again later or check your connection.");
            rej(e);
          }
        })
    })
  }

  /** don't forget refresh after deleting  */
  delete(id: number, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true)
      this.http.delete<SucResEditDel>(this.URL + '/' + id)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false)
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false)
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the program. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }

  // /** program.activities will be array of IActivityEntity of the fetched program */
  // fetchOne(programId: number): Promise<IActivityEntity> {
  //   return new Promise((res,rej)=>{
  //     this.http.get<IActivityEntity[]>(this.URL+'/'+programId)
  //     .subscribe({
  //       next:v=>res(v[0]),
  //       error:e=>{
  //         this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the program. Please try again later or check your connection."); rej(e);
  //       }
  //     })
  //   })
  // }
}
