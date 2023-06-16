import { Directive } from "@angular/core";
import { Subscription } from "rxjs";

@Directive()
export abstract class UnsubOnDestroy {
  public sub: Subscription = new Subscription();

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
