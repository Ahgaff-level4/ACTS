import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'range'
})
export class RangePipe implements PipeTransform {

  /**example: `<div *ngFor="let i of 10 | range:20">This is item {{i}}</div>`
This will create 10 div elements with the index from 10 to 19. Note that the end argument is exclusive, just like in Python. */
  transform(start: number, end: number): number[] {
    return Array.from({ length: end - start }, (v, i) => i + start);
  }
}
