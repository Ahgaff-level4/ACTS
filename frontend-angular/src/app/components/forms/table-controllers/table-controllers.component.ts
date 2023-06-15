import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table-controllers',
  templateUrl: './table-controllers.component.html',
  styleUrls: ['./table-controllers.component.scss']
})/**
- button1/anchor1 will be `mat-raised-button` others are `mat-stroked-button`.
- there should no be a buttonN and anchorN with the same number N (i.e button1={...} AND anchor1={...}) a button is either an html <button>(buttonN) or <a>(anchorN) and the number is the order!
we didn't use array because <button> can not assign a function in the template. So, using the @Output() we have to assign individual buttons. Also to avoid multiple if conditions. Where mat-...-button are directives and if we made `button.style='stroked'` then we need to implement two different html buttons with the same properties but differ in the chosen directive (Directives can not be assigned base on a variable value) we need multiple if conditions */
export class TableControllersComponent {
  @Input() button1: Button | undefined;
  @Input() button2: Button | undefined;
  @Input() button3: Button | undefined;
  @Input() button4: Button | undefined;
  @Input() button5: Button | undefined;
  @Output() button1Click: EventEmitter<void> = new EventEmitter<void>();
  @Output() button2Click: EventEmitter<void> = new EventEmitter<void>();
  @Output() button3Click: EventEmitter<void> = new EventEmitter<void>();
  @Output() button4Click: EventEmitter<void> = new EventEmitter<void>();
  @Output() button5Click: EventEmitter<void> = new EventEmitter<void>();
  @Input() anchor1: Anchor | undefined;
  @Input() anchor2: Anchor | undefined;
  @Input() anchor3: Anchor | undefined;
  @Input() anchor4: Anchor | undefined;
  @Input() anchor5: Anchor | undefined;
  @Input() anchor6: Anchor | undefined;
}

interface Button {
  text: string,
  /**default is `true` */
  show?: boolean,
  /**default is `primary` */
  color?: 'primary' | 'accent' | 'warn',
  /**default false */
  disabled?: boolean,
  tooltip?: string,
  icon: string;
}
interface Anchor {
  text: string,
  link: string,
  /**default is `true` */
  show?: boolean,
  /**default is `primary` */
  color?: 'primary' | 'accent' | 'warn',
  /**default false */
  disabled?: boolean,
  tooltip?: string,
  icon: string;
}