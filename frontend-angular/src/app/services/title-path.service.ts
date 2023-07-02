import { Injectable } from '@angular/core';
import { TitleLink } from '../components/static/title/title.component';

@Injectable({
  providedIn: 'root'
})
export class TitlePathService {

  public links: TitleLink[] = [];

}
