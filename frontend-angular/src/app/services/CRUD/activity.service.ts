import { Injectable } from '@angular/core';
import { IActivityEntity, ICreateActivity, IFieldEntity, IProgramEntity, SucResEditDel } from '../../../../../interfaces';
import { environment as env } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from '../utility.service';
import { ProgramService } from './program.service';
import { BehaviorSubject, ReplaySubject, first, last } from 'rxjs';
import { NotificationService } from '../notification.service';
import { FieldService } from './field.service';
@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  public URL = env.API + 'activity';
  public programItsActivities$ = new BehaviorSubject<IProgramEntity | undefined>(undefined);
  public specialActivities$ = new BehaviorSubject<IActivityEntity[] | undefined>(undefined);
  public fieldItsActivities$ = new BehaviorSubject<IFieldEntity | undefined>(undefined);

  constructor(private http: HttpClient, private ut: UtilityService,
    private programService: ProgramService, private nt: NotificationService,
    private fieldService: FieldService,) {
  }

  public async postSpecialActivities(field: ICreateActivity, manageLoading = false): Promise<IActivityEntity> {
    if (typeof field.programId == 'number')
      throw 'Error: you just called postSpecialActivities for activity with program!!!!';
    const posted = await this._post(field, manageLoading);
    this.fetchSpecialActivities();
    return posted;
  }

  public async postProgramItsActivities(activity: ICreateActivity, manageLoading = false): Promise<IActivityEntity> {
    if (typeof activity.programId != 'number')
      throw 'Error: you just called postProgramItsActivities for specialActivity!';
    const posted = await this._post(activity, manageLoading);
    this.fetchProgramItsActivities(posted.programId!);
    return posted;
  }


  /**
  * @returns if request succeeded, `resolve` with the added entity, and call fetchProgramItsActivities() to emit the new entities. Otherwise show error dialog only.
  */
  private _post(field: ICreateActivity, manageLoading = false): Promise<IActivityEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IActivityEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem creating the activity. Please try again later or check your connection.");
            rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        })
    });
  }

  /**
   * @param id activity's id
   * @param updateActivity partial activity body
   */
  public async patchInSpecialActivities(id: number, updateActivity: Partial<IActivityEntity>, manageLoading = false): Promise<SucResEditDel> {
    const posted = await this._patch(id, updateActivity, manageLoading);
    this.fetchSpecialActivities();
    return posted;
  }

  /**
 * @param id activity's id
 * @param updateActivity partial activity body
 */
  public async patchInProgramItsActivities(id: number, updateActivity: Partial<IActivityEntity>, manageLoading = false): Promise<SucResEditDel> {
    const res = await this._patch(id, updateActivity, manageLoading);
    if (this.programItsActivities$.value)
      this.fetchProgramItsActivities(this.programItsActivities$.value.id);
    return res;
  }

  private _patch(id: number, updateActivity: Partial<IActivityEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true)
      this.http.patch<SucResEditDel>(this.URL + '/' + id, updateActivity)
        .subscribe({
          next: (v) => {
            res(v);
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem editing the activity. Please try again later or check your connection.");
            rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        })
    })
  }

  /**
   * @param id activity's id
   */
  public async deleteInSpecialActivities(id: number, manageLoading = false): Promise<SucResEditDel> {
    const posted = await this._delete(id, manageLoading);
    this.fetchSpecialActivities();
    return posted;
  }

  /**
   * @param id activity's id
   */
  public async deleteInProgramItsActivities(id: number, manageLoading = false): Promise<SucResEditDel> {
    const res = await this._delete(id, manageLoading);
    if (this.programItsActivities$.value)
      this.fetchProgramItsActivities(this.programItsActivities$.value.id);
    return res;
  }

  private _delete(id: number, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true)
      this.http.delete<SucResEditDel>(this.URL + '/' + id)
        .subscribe({
          next: (v) => {
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem deleting the activity. Please try again later or check your connection."); rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        })
    })
  }

  public fetchProgramItsActivities(programId: number, manageLoading: boolean = false): Promise<IProgramEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IProgramEntity[]>(this.programService.URL + '/' + programId)
        .subscribe({
          next: v => {
            if (v[0]) {
              this.programItsActivities$.next(v[0]);
              res(v[0]);
            } else {
              this.nt.errorDefaultDialog("Sorry, there was a problem fetching the program's activities. Please try again later or check your connection."); rej(v);
            }
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem fetching the program's activities. Please try again later or check your connection."); rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        })
    })
  }

  public fetchFieldItsActivities(fieldId: number, manageLoading: boolean = false): Promise<IFieldEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IFieldEntity[]>(this.fieldService.URL + '/' + fieldId)
        .subscribe({
          next: v => {
            if (v[0]) {
              this.fieldItsActivities$.next(v[0]);
              res(v[0]);
            } else {
              this.nt.errorDefaultDialog("Sorry, there was a problem fetching the field's activities. Please try again later or check your connection."); rej(v);
            }
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem fetching the field's activities. Please try again later or check your connection."); rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        })
    })
  }

  public fetchSpecialActivities(manageLoading = false): Promise<IActivityEntity[]> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IActivityEntity[]>(this.URL + '/special')
        .subscribe({
          next: v => {
            this.specialActivities$.next(v);
            res(v);
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem fetching the special activities. Please try again later or check your connection."); rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        })
    })
  }
}
