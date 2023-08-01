import { ChangeDetectorRef, Component } from '@angular/core';
import { DisplayService } from 'src/app/services/display.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent extends UnsubOnDestroy {
  public isLoading: boolean = true;

  constructor(private display: DisplayService, private cd: ChangeDetectorRef) { super() }

  ngOnInit() {
    this.sub.add(this.display.isLoading.subscribe(v => {
      this.isLoading = v;
      this.cd.detectChanges();
    }));
  }
}
