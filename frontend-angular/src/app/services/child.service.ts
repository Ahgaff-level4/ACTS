import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IChildEntity, ICreateChild, SucResEditDel } from '../../../../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment as env } from 'src/environment';
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
  fetchChildren(): Promise<void> {
    return new Promise((res, rej) => {
      this.http.get<IChildEntity[]>(this.childURL, { params: { 'FK': true } })
        .subscribe({ next: (v) => { this.children.next(v); res() }, error: (e) => { this.ut.errorDefaultDialog(e,"Sorry, there was a problem fetching the children information. Please try again later or check your connection."); rej(e); } });
    })
  }

  /**
 * api request to post a child information. Then append the new child with previous `children` BehaviorSubject and emit the new children array.
 * @returns `resolve` if request succeeded. Otherwise `reject`.
 */
  postChild(child: ICreateChild): Promise<IChildEntity> {
    return new Promise((res, rej) => {
      this.http.post<IChildEntity>(this.childURL, child)
        .subscribe({
          next: (v) => {
            this.fetchChildren()
            res(v);
          },
          error: (e) => {
            this.ut.errorDefaultDialog(e, "Sorry, there was a problem registering the child. Please try again later or check your connection.");
            rej(e);
          }
        })
    });
  }

  patchChild(id: number, child: Partial<IChildEntity>): Promise<SucResEditDel> {
    return new Promise((res, rej) => {
      this.http.patch<SucResEditDel>(this.childURL + '/' + id, child)
        .subscribe({
          next: (v) => { this.fetchChildren(); res(v) },
          error: e => {
            this.ut.errorDefaultDialog(e,"Sorry, there was a problem editing the child information. Please try again later or check your connection.");
            rej(e);
          }
        })
    })
  }
}


const TMP_DATA: IChildEntity[] = [
  {
    "femaleFamilyMembers": 2,
    "maleFamilyMembers": 2,
    "birthOrder": 3,
    "parentsKinship": "they are cousin",
    "diagnosticDate": "2018-05-02",
    "pregnancyState": "normal pregnancy",
    "birthState": "born in the seventh month",
    "growthState": "grow normal",
    "diagnostic": "diagnostied with autism",
    "medicine": "Antibiotic",
    "behaviors": "very quite",
    "prioritySkills": "learn speaking and social intraction",
    "isArchive": false,
    "parentId": 2,
    "personId": 8,
    "id": 1,
    "familyMembers": 4,
    "durationSpent": 2,
    "person": {
      "name": "Noor",
      "birthDate": "2008-01-24",
      "gender": "Female",
      "createdDatetime": new Date("2023-03-31T19:24:19.204Z"),
      "id": 8,
      "age": 15
    },
    "goals": [],
    "teachers": []
  },
  {
    "femaleFamilyMembers": null,
    "maleFamilyMembers": null,
    "birthOrder": null,
    "parentsKinship": null,
    "diagnosticDate": null,
    "pregnancyState": null,
    "birthState": null,
    "growthState": null,
    "diagnostic": null,
    "medicine": null,
    "behaviors": null,
    "prioritySkills": null,
    "isArchive": false,
    "parentId": null,
    "personId": 9,
    "id": 2,
    "familyMembers": null,
    "durationSpent": 456,
    "person": {
      "name": "Omer",
      "birthDate": "2009-01-24",
      "gender": "Male",
      "createdDatetime": new Date("2021-12-31T21:00:00.000Z"),
      "id": 9,
      "age": 14
    },
    "goals": [],
    "teachers": []
  },
  {
    "femaleFamilyMembers": null,
    "maleFamilyMembers": null,
    "birthOrder": null,
    "parentsKinship": null,
    "diagnosticDate": null,
    "pregnancyState": null,
    "birthState": null,
    "growthState": null,
    "diagnostic": null,
    "medicine": null,
    "behaviors": null,
    "prioritySkills": null,
    "isArchive": true,
    "parentId": null,
    "personId": 13,
    "id": 3,
    "familyMembers": null,
    "durationSpent": 2,
    "person": {
      "name": "Nothing",
      "birthDate": null,
      "gender": "Female",
      "createdDatetime": new Date("2023-03-31T19:24:19.222Z"),
      "id": 13,
      "age": null
    },
    "goals": [],
    "teachers": []
  }
];
