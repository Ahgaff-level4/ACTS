import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './utility.service';
import { IGoalEntity, ICreateEvaluation, IEvaluationEntity, SucResEditDel } from '../../../../interfaces';
import { BehaviorSubject } from 'rxjs';
import { ChildService } from './child.service';
import { GoalService } from './goal.service';
@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  URL = env.API + 'evaluation';
  /**Child object with its goals. The idea is that: this child will be replaced every time user check another child goals. And it is in service so it is shared with other components */
  public goalItsEvaluations = new BehaviorSubject<IGoalEntity | undefined>(undefined)

  constructor(private http: HttpClient, private ut: UtilityService, private goalService: GoalService) { }

  /**
  * @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
  */
  post(field: ICreateEvaluation, manageLoading = false): Promise<IEvaluationEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IEvaluationEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this.goalItsEvaluations.value?.id)
              this.fetchGoalItsEvaluations(this.goalItsEvaluations.value.id);
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem while creating the evaluation record. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  patch(id: number, entity: Partial<IEvaluationEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.URL + '/' + id, entity)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this.goalItsEvaluations.value?.id)
              this.fetchGoalItsEvaluations(this.goalItsEvaluations.value.id);
            res(v)
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the evaluation. Please try again later or check your connection.");
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
            if (this.goalItsEvaluations.value?.id)
              this.fetchGoalItsEvaluations(this.goalItsEvaluations.value.id);
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the evaluation. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }

  /** Fetch the goal and emit it to goalItsEvaluations BehaviorSubject
   * - goal.evaluations are defined
   * - child.goals[...].activity is defined
   * - child.goals[...].activity.field is defined
   * @param id goal.id
   * */
  public fetchGoalItsEvaluations(id: number, manageLoading = false): Promise<IGoalEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IGoalEntity[]>(this.goalService.URL + '/' + id)
        .subscribe({
          next: v => {
            manageLoading && this.ut.isLoading.next(false);
            if (Array.isArray(v) && v.length != 0) {
              this.goalItsEvaluations.next(v[0]);
              res(v[0]);
            }
            else {
              this.ut.errorDefaultDialog(undefined, "Sorry, there was a problem fetching the goal's evaluations. Please try again later or check your connection."); rej(v);
            }
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the goal's evaluations. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }

}
