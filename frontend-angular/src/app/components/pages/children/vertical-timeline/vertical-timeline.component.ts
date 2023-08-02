import { Component, Input, OnInit } from '@angular/core';
import { NgxTimelineEvent } from '@frxjs/ngx-timeline';
import { BehaviorSubject, map } from 'rxjs';
import { DisplayService } from 'src/app/services/display.service';
import { VerticalTimelineService } from 'src/app/services/vertical-timeline.service';
import { ITimelineEvent } from '../../../../../../../interfaces';
type TimelineEvent = NgxTimelineEvent & { state: 'goal' | 'strength' | 'evaluation' | 'child', image: string, buttonText: string, buttonIcon: string, link: string, };
@Component({
  selector: 'app-vertical-timeline[forWho][id]',
  templateUrl: './vertical-timeline.component.html',
  styleUrls: ['./vertical-timeline.component.scss']
})
export class VerticalTimelineComponent implements OnInit {
  @Input() public forWho!: 'child' | 'account';//this is for the server.
  @Input() public id!: number;
  public events$: BehaviorSubject<TimelineEvent[]> = new BehaviorSubject<TimelineEvent[]>([]);
  private skip: number = 0;
  private take: number = 5;//chunk size
  public loading: boolean = true;

  constructor(private service: VerticalTimelineService, public display: DisplayService) { }

  ngOnInit(): void {
    this.service.fetch(this.forWho, this.id, this.take, this.skip).pipe(map(v => this.myMap(v)))
      .subscribe((v) => {
        this.loading = false;
        this.events$.next(v);
      })
  }

  myMap(v: ITimelineEvent[]): TimelineEvent[] {
    return v.map(v => {
      let event: TimelineEvent;

      if (v.state == 'goal')
        event = {
          description: this.concat(['New goal was added:',
            v.goal.activity.name, 'to child:', v.goal.child.person.name,
            'by teacher:', v.goal.teacher.person.name, 'with state:',
            this.display.titleCasePipe.transform(v.goal.state)]),
          timestamp: new Date(v.goal.assignDatetime),
          image: 'Continual-goals.svg',
          state: v.state,
          buttonText: 'View child\'s goals',
          buttonIcon: 'sports_score',
          link: 'children/child/' + v.goal.childId + '/goals',
        };
      else if (v.state == 'strength')
        event = {
          description: this.concat(['New strength was added:',
            v.strength.activity.name, 'to child:', v.strength.child.person.name,
            'by teacher:', v.strength.teacher.person.name, '.']),
          timestamp: new Date(v.strength.assignDatetime),
          image: 'Completed-goals.svg',
          state: v.state,
          buttonText: 'View Child\'s strengths',
          buttonIcon: 'fitness_center',
          link: 'children/child/' + v.strength.childId + '/strengths',
        };
      else if (v.state == 'child')
        event = {
          description: this.concat(['New child was register:', v.child.person.name,
            'and the following teachers are teaching him:',
            this.display.childTeachersPipe.transform(v.child)]),
          timestamp: new Date(v.child.person.createdDatetime),
          image: 'girl.svg',
          state: v.state,
          buttonText: 'View Child Information',
          buttonIcon: 'person',
          link: 'children/child/' + v.child.id,
        };
      else if (v.state == 'evaluation')
        event = {
          description: this.concat(['Teacher:', v.evaluation.teacher.person.name,
            'evaluate the goal:', v.evaluation.goal.activity.name, 'with the following description:',
            'with rate:', this.display.titleCasePipe.transform(v.evaluation.rate),
            'and description:', v.evaluation.description,
            'for child:', v.evaluation.goal.child.person.name]),
          timestamp: new Date(v.evaluation.evaluationDatetime),
          image: 'Activity.svg',
          state: v.state,
          buttonText: 'View Goal\'s Evaluations',
          buttonIcon: 'reviews',
          link: 'children/child/' + v.evaluation.goal.childId + '/goals/goal/' + v.evaluation.goalId + '/evaluations'
        };
      else throw 'Timeline event has unexpected state value. state=' + (v as any).state;
      return event;
    })
  }

  /**
   *
   * @param sentences array of string or values
   * @returns a string that translate each sentences and join them with a space.
   */
  concat(sentences: (string | number)[]): string {
    return sentences.map(v => this.display.translate(v.toString())).join(' ');
  }

  loadMore() {
    this.loading = true;
    this.skip += this.take;
    this.service.fetch(this.forWho, this.id, 5, this.skip)
      .pipe(map(v => this.myMap(v)), map(v => this.events$.value.concat(v)))
      .subscribe(v => {
        this.loading = false;
        this.events$.next(v);
      });
  }
}
