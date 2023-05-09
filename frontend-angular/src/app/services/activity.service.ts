import { Injectable } from '@angular/core';
import { IActivityEntity, ICreateActivity, IProgramEntity, SucResEditDel } from '../../../../interfaces';
import { environment as env } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { UtilityService } from './utility.service';
import { ProgramService } from './program.service';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  public URL = env.API + 'activity';
  public programItsActivities = new BehaviorSubject<IProgramEntity | undefined>(undefined);
  public specialActivities = new BehaviorSubject<IActivityEntity[] | undefined>(undefined);
  constructor(private http: HttpClient, private ut: UtilityService, private programService: ProgramService) { }

  /**
  * @returns if request succeeded, `resolve` with the added entity, and call fetchProgramItsActivities() to emit the new entities. Otherwise show error dialog only.
  */
  post(field: ICreateActivity, manageLoading = false): Promise<IActivityEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IActivityEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this.programItsActivities.value)
              this.fetchProgramItsActivities(this.programItsActivities.value.id);
            if (this.specialActivities.value)
              this.fetchSpecialActivities();
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false)
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the activity. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  patch(id: number, child: Partial<IActivityEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true)
      this.http.patch<SucResEditDel>(this.URL + '/' + id, child)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this.programItsActivities.value)
              this.fetchProgramItsActivities(this.programItsActivities.value.id);
            if (this.specialActivities.value)
              this.fetchSpecialActivities();
            res(v);
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the activity. Please try again later or check your connection.");
            rej(e);
          }
        })
    })
  }

  delete(id: number, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true)
      this.http.delete<SucResEditDel>(this.URL + '/' + id)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            if (this.programItsActivities.value)
              this.fetchProgramItsActivities(this.programItsActivities.value.id);
            if (this.specialActivities.value)
              this.fetchSpecialActivities();
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false)
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the activity. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }

  fetchProgramItsActivities(programId: number, manageLoading: boolean = false):Promise<IProgramEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IProgramEntity[]>(this.programService.URL + '/' + programId)
        .subscribe({
          next: v => {
            manageLoading && this.ut.isLoading.next(false);
            this.programItsActivities.next(v[0]);
            res(v[0]);
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the program's activities. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }

  fetchSpecialActivities(manageLoading = false):Promise<IActivityEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IActivityEntity[]>(this.URL + '/special')
        .subscribe({
          next: v => {
            manageLoading && this.ut.isLoading.next(false);
            this.specialActivities.next(v);
            res(v[0]);
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the special activities. Please try again later or check your connection."); rej(e);
          }
        })
    })
  }
}
