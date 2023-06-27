import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeframeComponent } from './timeframe.component';

describe('TimeframeComponent', () => {
  let component: TimeframeComponent;
  let fixture: ComponentFixture<TimeframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeframeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
