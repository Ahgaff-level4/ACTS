import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'
import {} from '@backend'
@Injectable({
  providedIn: 'root'
})
export class FieldService {
  constructor() { }
  public fieldsSubject = new BehaviorSubject<Field[]>([]);
}
