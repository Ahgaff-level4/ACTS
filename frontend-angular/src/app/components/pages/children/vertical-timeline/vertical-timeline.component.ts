import { Component, Input, OnInit } from '@angular/core';
import { NgxTimelineEvent } from '@frxjs/ngx-timeline';
import { Observable, filter, map } from 'rxjs';
import { DisplayService } from 'src/app/services/display.service';
import { VerticalTimelineService } from 'src/app/services/vertical-timeline.service';
type TimelineEvent = NgxTimelineEvent & { state: 'goal' | 'strength' | 'evaluation' | 'child', image: string, buttonText: string, buttonIcon: string, link: string, };
@Component({
  selector: 'app-vertical-timeline[forWho][id]',
  templateUrl: './vertical-timeline.component.html',
  styleUrls: ['./vertical-timeline.component.scss']
})
export class VerticalTimelineComponent implements OnInit {
  @Input() public forWho!: 'child' | 'parent' | 'teacher';//this is for the server.
  @Input() public id!: number;
  public events$!: Observable<TimelineEvent[]>

  constructor(private service: VerticalTimelineService, private display: DisplayService) { }

  ngOnInit(): void {
    this.events$ = this.service.fetch(this.forWho, this.id).pipe(map(v => {
      console.log('timeline events length=', v.length);
      v.splice(50, v.length - 50)
      return v.map(v => {
        let event: TimelineEvent;

        if (v.state == 'goal')
          event = {
            description: `New goal was added ${v.goal.activity.name} to child ${v.goal.child.person.name},`,
            timestamp: new Date(v.goal.assignDatetime),
            image: 'Continual-goals.svg',
            state: v.state,
            buttonText: 'View child\'s goals',
            buttonIcon: 'sports_score',
            link: 'children/child/' + v.goal.childId + '/goals',
          };
        else if (v.state == 'strength')
          event = {
            description: v.strength.activity.name,
            timestamp: new Date(v.strength.assignDatetime),
            image: 'Completed-goals.svg',
            state: v.state,
            buttonText: 'View Child\'s strengths',
            buttonIcon: 'fitness_center',
            link: 'children/child/' + v.strength.childId + '/strengths',
          };
        else if (v.state == 'child')
          event = {
            description: v.child.person.name,
            timestamp: new Date(v.child.person.createdDatetime),
            image: 'girl.svg',
            state: v.state,
            buttonText: 'View Child Information',
            buttonIcon: 'person',
            link: 'children/child/' + v.child.id,
          };
        else if (v.state == 'evaluation')
          event = {
            description: v.evaluation.description,
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
    }), filter((v, i) => i % 2 == 0));
  }

  /**
   *
   * @param sentences array of string or values
   * @returns a string that translate each sentences and join them with a space.
   */
  madeDescriptionOf(sentences: (string | number)[]): string {
    return sentences.map(v => this.display.translate(v.toString())).join(' ');
  }
}
