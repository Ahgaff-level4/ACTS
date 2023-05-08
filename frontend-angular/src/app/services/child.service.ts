import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IChildEntity, ICreateChild, SucResEditDel } from '../../../../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment as env } from 'src/environments/environment';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class ChildService {
  public childURL = env.API + 'child';
  constructor(private http: HttpClient, private ut: UtilityService) {
    // this.children.next(TMP_DATA);
    // this.fetchChildren(); if you need children then first subscribe to children SubjectBehavior then call fetchChildren.
  }

  public children = new BehaviorSubject<IChildEntity[]>([]);
  /**
   * create api request to retrieve children information and broadcast it to `children` BehaviorSubject.
   * @returns `resolve` if request succeeded. Otherwise `reject`.
   */
  fetchChildren(manageLoading = false): Promise<void> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true)
      this.http.get<IChildEntity[]>(this.childURL, { params: { 'FK': true } })
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.children.next(v);
            res()
          }, error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem fetching the children information. Please try again later or check your connection."); rej(e);
          }
        });
    })
  }

  /**
 * api request to post a child information. Then append the new child with previous `children` BehaviorSubject and emit the new children array.
 * @returns `resolve` if request succeeded. Otherwise `reject`.
 */
  postChild(child: ICreateChild, manageLoading = false): Promise<IChildEntity> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.post<IChildEntity>(this.childURL, child)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.fetchChildren()
            res(v);
          },
          error: (e) => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem registering the child. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  patchChild(id: number, child: Partial<IChildEntity>, manageLoading = false): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      manageLoading && this.ut.isLoading.next(true);
      this.http.patch<SucResEditDel>(this.childURL + '/' + id, child)
        .subscribe({
          next: (v) => {
            manageLoading && this.ut.isLoading.next(false);
            this.fetchChildren(); res(v)
          },
          error: e => {
            manageLoading && this.ut.isLoading.next(false);
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem editing the child information. Please try again later or check your connection.");
            rej(e);
          }
        })
    })
  }


}
