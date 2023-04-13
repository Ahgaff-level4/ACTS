import { Injectable } from '@angular/core';
import { environment as env } from 'src/environment';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './utility.service';
import { IChildEntity, ICreateGoal, IGoalEntity, SucResEditDel } from '../../../../interfaces';
import { BehaviorSubject } from 'rxjs';
import { ChildService } from './child.service';
@Injectable({
  providedIn: 'root'
})
export class GoalService {
  URL = env.API + 'goal';
  /**Child object with its goals. The idea is that: this child will be replaced every time user check another child goals. And it is in service so it is shared with other components */
  public childItsGoals = new BehaviorSubject<IChildEntity | undefined>(undefined)

  constructor(private http: HttpClient, private ut: UtilityService, private childService: ChildService) { }
  /**
  * @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
  * don't forget refresh table after adding
  */
  post(field: ICreateGoal): Promise<IGoalEntity> {
    return new Promise((res, rej) => {
      this.http.post<IGoalEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            res(v);
          },
          error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the program. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  /** don't forget refresh after editing */
  patch(id: number, child: Partial<IGoalEntity>): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      this.http.patch<SucResEditDel>(this.URL + '/' + id, child)
        .subscribe({
          next: (v) => { res(v) },
          error: e => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the goal. Please try again later or check your connection.");
            rej(e);
          }
        })
    })
  }

  /** don't forget refresh after deleting  */
  delete(id: number): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      this.http.delete<SucResEditDel>(this.URL + '/' + id)
        .subscribe({
          next: (v) => { res(v) },
          error: (e) => { this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the goal. Please try again later or check your connection."); rej(e); }
        })
    })
  }

  /** Fetch the child and emit it to childItsGoals BehaviorSubject
   * - child.goals are defined
   * - child.goals[...].activity is defined
   * - child.goals[...].activity.field is defined
   * */
  public fetchChildItsGoals(id: number): Promise<IChildEntity> {
    return new Promise((res, rej) => {
      this.http.get<IChildEntity[]>(this.childService.childURL + '/' + id)
        .subscribe({
          next: v => {
            if (Array.isArray(v) && v.length != 0) {
              this.childItsGoals.next(v[0]);
              res(v[0]);
            }
            else { this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the child's goals. Please try again later or check your connection."); rej(v); }
          },
          error: e => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the child's goals. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }

}
