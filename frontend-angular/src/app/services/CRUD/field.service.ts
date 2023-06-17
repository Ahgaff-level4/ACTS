import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, shareReplay } from 'rxjs'
import { ICreateField, IFieldEntity, SucResEditDel } from '../../../../../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment as env } from 'src/environments/environment';
import { UtilityService } from '../utility.service';

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  public URL = env.API + 'field';
  private subject$: Subject<IFieldEntity[]> = new Subject<IFieldEntity[]>();//Made to emit new values into the Observable's subscribers
  /**Observable function will start execution when the first observer subscribe. Then it will emit new values by the subject. */
  public fields$: Observable<IFieldEntity[]> = new Observable<IFieldEntity[]>((subscriber) => {
    this.subject$.subscribe(subscriber);
    this.fetch().then(v => this.subject$.next(v))
      .catch(() => { });
  }).pipe(shareReplay(1));

  constructor(private http: HttpClient, private ut: UtilityService) {
  }

  /** fetch fields from DB and emit it to fields */
  public fetch(manageLoading = false): Promise<IFieldEntity[]> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.get<IFieldEntity[]>(this.URL)
        .subscribe({
          next: (v) => {
            this.subject$.next(v); res(v);
          }, error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the fields. Please try again later or check your connection."); rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        });
    })
  }

  /**
 * @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
 */
  post(field: ICreateField, manageLoading = false): Promise<IFieldEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IFieldEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem creating the field. Please try again later or check your connection.");
            rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        })
    });
  }

  patch(id: number, field: Partial<IFieldEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.URL + '/' + id, field)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: e => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the field. Please try again later or check your connection.");
            rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        })
    })
  }

  delete(id: number, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.delete<SucResEditDel>(this.URL + '/' + id)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem deleting the field. Please try again later or check your connection."); rej(e);
          }, complete: () => { manageLoading && this.ut.isLoading.next(false); }
        })
    })
  }
}
