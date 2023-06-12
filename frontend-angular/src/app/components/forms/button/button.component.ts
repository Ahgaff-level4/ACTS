import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})/**
Shared component used to reduce duplication
of common/default properties of all buttons in the app */
export class ButtonComponent implements OnInit {
  @Input() color: 'primary' | 'accent' | 'warn' | 'none' = 'primary';
  @Input() disabled: boolean = false;
  /**`undefined` mean it is <button>. If there is a value then it is <a> element*/
  @Input() link: string | undefined = undefined;
  @Input() appearance: 'basic' | 'stroked' | 'flat' | 'raised' | 'icon' = 'basic';
  @Input() icon: string | undefined = undefined;
  @Input() text: string = '';
  @Input() tooltip: string = '';
  @Output() click: EventEmitter<any> = new EventEmitter();
  @Input() class:string = '';

  ngOnInit() {
    const msg = 'Invalid app-button configuration ';
    if (this.appearance == 'icon' && this.text.length > 0)
      throw msg + 'appearance=' + this.appearance + ' while there exist text=' + this.text;
    if (this.appearance == 'icon' && this.icon == undefined)
      throw msg + 'appearance=' + this.appearance + ' while icon=' + this.icon;
    if (this.link && this.click)
      throw msg + 'link and click exist at the same time!';

  }
}
