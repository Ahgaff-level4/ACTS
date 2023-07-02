import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-control-buttons[buttons]',
  templateUrl: './control-buttons.component.html',
  styleUrls: ['./control-buttons.component.scss']
})/**
- first button will be `mat-raised-button` others are `mat-stroked-button`. just ignore first element if you don't want raised button
we didn't use array of EventEmitter because parent component can't handle array of EventEmitter */
export class ControlButtonsComponent {
  @Input() buttons!: [null | Button, ...Button[]];

  /**Each event correspond to the index of a button in `buttons` array */
  @Output('click0') click0: EventEmitter<void> = new EventEmitter<void>();
  @Output('click1') click1: EventEmitter<void> = new EventEmitter<void>();
  @Output('click2') click2: EventEmitter<void> = new EventEmitter<void>();
  @Output('click3') click3: EventEmitter<void> = new EventEmitter<void>();
  @Output('click4') click4: EventEmitter<void> = new EventEmitter<void>();
  @Output('click5') click5: EventEmitter<void> = new EventEmitter<void>();//if a parent uses more that 6 buttons then just add click6 :)

  constructor(private ut: UtilityService) { }

  protected clicked(buttonIndex: number) {
    const btn = this.buttons[buttonIndex];
    if (btn?.link)
      this.ut.router.navigateByUrl(btn.link);
    else
      switch (buttonIndex) {
        case 0: this.click0.emit(); break;
        case 1: this.click1.emit(); break;
        case 2: this.click2.emit(); break;
        case 3: this.click3.emit(); break;
        case 4: this.click4.emit(); break;
        case 5: this.click5.emit(); break;
      }
  }

  protected getStrokedButtons(): Button[] {
    const [raised, ...stroked] = this.buttons;
    return stroked;
  }
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
  /**If button has link then its correspond (clicks[buttonIndex]) event won't fire, and will navigate to the provided link instead */
  link?: string;
}
