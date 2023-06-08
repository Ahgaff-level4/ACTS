import { Injectable } from '@angular/core';
import { IActivityEntity, ICreateActivity, IProgramEntity, SucResEditDel } from '../../../../interfaces';
import { environment as env } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './utility.service';
import { ProgramService } from './program.service';
import { BehaviorSubject, ReplaySubject, first, last } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  public URL = env.API + 'activity';
  public programItsActivities = new ReplaySubject<IProgramEntity | undefined>(1);
  public specialActivities = new ReplaySubject<IActivityEntity[]>(1);
  private _programItsActivities: undefined | IProgramEntity;
  constructor(private http: HttpClient, private ut: UtilityService,
    private programService: ProgramService) {
    this.fetchSpecialActivities();
    this.programItsActivities.next(undefined);//to call next for first subscriber. Should then check if next's value is the Program needed or call `fetchProgramItsActivities` with needed programId
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
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the activity. Please try again later or check your connection.");
            rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);}
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
    if (this._programItsActivities)
      this.fetchProgramItsActivities(this._programItsActivities.id);
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
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the activity. Please try again later or check your connection.");
            rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);}
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
    if (this._programItsActivities)
      this.fetchProgramItsActivities(this._programItsActivities.id);
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
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the activity. Please try again later or check your connection."); rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);}
        })
    })
  }

  /**NEVER use it before checking `programItsActivities` buffer! */
  public fetchProgramItsActivities(programId: number, manageLoading: boolean = false): Promise<IProgramEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IProgramEntity[]>(this.programService.URL + '/' + programId)
        .subscribe({
          next: v => {
            this.programItsActivities.next(v[0]);
            this._programItsActivities = v[0];
            res(v[0]);
          },
          error: e => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the program's activities. Please try again later or check your connection."); rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);}
        })
    })
  }

  private fetchSpecialActivities(manageLoading = false): Promise<IActivityEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IActivityEntity[]>(this.URL + '/special')
        .subscribe({
          next: v => {
            this.specialActivities.next(v);
            res(v[0]);
          },
          error: e => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the special activities. Please try again later or check your connection."); rej(e);
          },complete:()=>{manageLoading && this.ut.isLoading.next(false);}
        })
    })
  }
}
