import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './utility.service';
import { IChildEntity, ICreateGoal, IGoalEntity, SucResEditDel } from '../../../../interfaces';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { ChildService } from './child.service';
@Injectable({
  providedIn: 'root'
})
export class GoalService {
  URL = env.API + 'goal';
  public childItsGoals = new ReplaySubject<IChildEntity | undefined>(1);
  private _childItsGoals: undefined | IChildEntity;

  constructor(private http: HttpClient, private ut: UtilityService, private childService: ChildService) {
    this.childItsGoals.next(undefined);
  }

  /**
  * @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
  */
  post(field: ICreateGoal, manageLoading = false): Promise<IGoalEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IGoalEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this._childItsGoals)
              this.fetchChildItsGoals(this._childItsGoals.id); res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the goal. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  patch(id: number, goal: Partial<IGoalEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.URL + '/' + id, goal)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this._childItsGoals)
              this.fetchChildItsGoals(this._childItsGoals.id); res(v)
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the goal. Please try again later or check your connection.");
            rej(e);
          }
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
            if (this._childItsGoals)
              this.fetchChildItsGoals(this._childItsGoals.id);
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the goal. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }

  /** Fetch the child and emit it to childItsGoals BehaviorSubject
   * - child.goals are defined
   * - child.goals[...].activity is defined
   * - child.goals[...].activity.field is defined
   * */
  public fetchChildItsGoals(id: number, manageLoading = false): Promise<IChildEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IChildEntity[]>(this.childService.childURL + '/' + id + '/goals')
        .subscribe({
          next: v => {
            manageLoading && this.ut.isLoading.next(false);
            if (Array.isArray(v) && v.length != 0) {
              this._childItsGoals = v[0];
              this.childItsGoals.next(v[0]);
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
