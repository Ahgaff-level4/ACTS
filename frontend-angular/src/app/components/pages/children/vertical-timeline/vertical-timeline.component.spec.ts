import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalTimelineComponent } from './vertical-timeline.component';

describe('ChildVerticalTimelineComponent', () => {
  let component: VerticalTimelineComponent;
  let fixture: ComponentFixture<VerticalTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerticalTimelineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerticalTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
