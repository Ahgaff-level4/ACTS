import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'type'
})
export class TypePipe implements PipeTransform {

  transform(value: any, type: 'bigint' | 'boolean' | 'function' | 'string' | 'number' | 'object' | 'symbol' | 'undefined'): boolean {
    if (value === null)//null is consider typeof `object` :/
      value = undefined;
    return (typeof value === type);
  }

}
