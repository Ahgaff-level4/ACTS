import { ChangeDetectorRef, Component } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { UnsubOnDestroy } from 'src/app/unsub-on-destroy';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent extends UnsubOnDestroy {
  public isLoading: boolean = true;

  constructor(private ut: UtilityService, private cd: ChangeDetectorRef) { super() }

  ngOnInit() {
    this.sub.add(this.ut.isLoading.subscribe(v => {
      this.isLoading = v;
      this.cd.detectChanges();
    }));
  }
}
