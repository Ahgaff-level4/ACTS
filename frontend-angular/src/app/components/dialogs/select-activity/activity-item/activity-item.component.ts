import { Component, Input } from '@angular/core';
import { IActivityEntity, IChildEntity } from '../../../../../../../interfaces';

@Component({
  selector: 'app-activity-item[activity]',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss']
})
export class ActivityItemComponent {
  @Input() activity!: IActivityEntity;
  @Input() child?: IChildEntity
  isActivityChildGoal(activity: IActivityEntity): boolean {
    return this.child?.goals?.map(v => v.activityId).includes(activity.id) ?? false;
  }

  isActivityChildStrength(activity: IActivityEntity): boolean {
    return this.child?.strengths?.map(v => v.activityId).includes(activity.id) ?? false;
  }
}
