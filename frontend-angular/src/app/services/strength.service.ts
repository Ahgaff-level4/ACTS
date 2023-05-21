import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { IChildEntity, ICreateStrength, IStrengthEntity, SucResEditDel } from '../../../../interfaces';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './utility.service';
import { ChildService } from './child.service';
import { GoalService } from './goal.service';
@Injectable({
  providedIn: 'root'
})
/**
 * Strength is Goal in DB and Server.
 * The only difference is when fetching the "goals" if we want child's goals then `where goal.state != 'strength'`.
 * When we want child's strengths then `where goal.state == 'strength'`.
 * This is done in the server depends on the url:
 * - server path for child's goals is `api/child/:id/goals`
 * - server path for child's strengths is `api/child/:id/strengths`
 */
export class StrengthService {
  /**Child object with its strengths. The idea is that: this child will be replaced every time user check another child strengths. And it is in service so it is shared with other components */
  public childItsStrengths = new BehaviorSubject<IChildEntity | undefined>(undefined)

  constructor(private http: HttpClient, private ut: UtilityService, private childService: ChildService, private goalService:GoalService) { }
  /**
  * @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
  */
  post(field: ICreateStrength, manageLoading = false): Promise<IStrengthEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IStrengthEntity>(this.goalService.URL, field)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this.childItsStrengths.value?.id)
              this.fetchChildItsStrengths(this.childItsStrengths.value.id);
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the strength. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  patch(id: number, child: Partial<IStrengthEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.goalService.URL + '/' + id, child)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this.childItsStrengths.value?.id)
              this.fetchChildItsStrengths(this.childItsStrengths.value.id);
            res(v)
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the strength. Please try again later or check your connection.");
            rej(e);
          }
        })
    })
  }

  delete(id: number, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.delete<SucResEditDel>(this.goalService.URL + '/' + id)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this.childItsStrengths.value?.id)
              this.fetchChildItsStrengths(this.childItsStrengths.value.id);
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the strength. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }

  /** Fetch the child and emit it to childItsStrengths BehaviorSubject
   * - child.strengths are defined
   * - child.strengths[...].activity is defined
   * - child.strengths[...].activity.field is defined
   * */
  public fetchChildItsStrengths(id: number, manageLoading = false): Promise<IChildEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IChildEntity[]>(this.childService.childURL + '/' + id+'/strengths')
        .subscribe({
          next: v => {
            manageLoading && this.ut.isLoading.next(false);
            if (Array.isArray(v) && v.length != 0) {
              this.childItsStrengths.next(v[0]);
              res(v[0]);
            }
            else {
              this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the child's goals. Please try again later or check your connection."); rej(v);
            }
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the child's goals. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }

}
