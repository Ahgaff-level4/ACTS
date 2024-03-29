import { Injectable } from '@angular/core';
import { Observable, Subject, shareReplay } from 'rxjs';
import { ICreateProgram, IProgramEntity, SucResEditDel } from '../../../../../interfaces';
import { environment as env } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../notification.service';
import { DisplayService } from '../display.service';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  public URL = env.API + 'program';
  private subject$: Subject<IProgramEntity[]> = new Subject<IProgramEntity[]>();//Made to emit new values into the Observable's subscribers
  /**Observable function will start execution when the first observer subscribe. Then it will emit new values by the subject. */
  public programs$: Observable<IProgramEntity[]> = new Observable<IProgramEntity[]>((subscriber) => {
    this.subject$.subscribe(subscriber);
    this.fetch().then(v => this.subject$.next(v))
      .catch(() => { });
  }).pipe(shareReplay(1));


  constructor(private http: HttpClient, private display: DisplayService,private nt:NotificationService,) {
  }

  /** fetch programs from DB and emit it to programs */
  public fetch(manageLoading = false): Promise<IProgramEntity[]> {
    return new Promise((res, rej) => {
      manageLoading && this.display.isLoading.next(true);
      this.http.get<IProgramEntity[]>(this.URL)
        .subscribe({
          next: (v) => {
            this.subject$.next(v); res(v);
          }, error: (e) => {
            manageLoading && this.display.isLoading.next(false);
            this.nt.errorDefaultDialog(e, 'Sorry, there was a problem fetching the programs. Please try again later or check your connection.'); rej(e);
          }, complete: () => { manageLoading && this.display.isLoading.next(false); }
        });
    })
  }

  /**
 * @returns if request succeeded, `resolve` with the added entity, and call fetch() to emit the new entities. Otherwise show error dialog and `reject`.
 */
  post(field: ICreateProgram, manageLoading = false): Promise<IProgramEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.display.isLoading.next(true);
      this.http.post<IProgramEntity>(this.URL, field)
        .subscribe({
          next: (v) => {
            this.fetch();
            res(v);
          },
          error: (e) => {
            manageLoading && this.display.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem creating the program. Please try again later or check your connection.");
            rej(e);
          }, complete: () => { manageLoading && this.display.isLoading.next(false); }
        })
    });
  }

  patch(id: number, child: Partial<IProgramEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.display.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.URL + '/' + id, child)
        .subscribe({
          next: (v) => {
            this.fetch(); res(v)
          },
          error: e => {
            manageLoading && this.display.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem editing the program. Please try again later or check your connection.");
            rej(e);
          }, complete: () => { manageLoading && this.display.isLoading.next(false); }
        })
    })
  }

  delete(id: number, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.display.isLoading.next(true);
      this.http.delete<SucResEditDel>(this.URL + '/' + id)
        .subscribe({
          next: (v) => {
            this.fetch(); res(v)
          },
          error: (e) => {
            manageLoading && this.display.isLoading.next(false);
            this.nt.errorDefaultDialog(e, "Sorry, there was a problem deleting the program. Please try again later or check your connection."); rej(e);
          }, complete: () => { manageLoading && this.display.isLoading.next(false); }
        })
    })
  }


}
