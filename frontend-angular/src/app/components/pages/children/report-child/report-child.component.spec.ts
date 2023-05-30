import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportChildComponent } from './report-child.component';

describe('ReportChildComponent', () => {
  let component: ReportChildComponent;
  let fixture: ComponentFixture<ReportChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportChildComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
