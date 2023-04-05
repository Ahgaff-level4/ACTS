import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildGoalsComponent } from './child-goals.component';

describe('ChildGoalsComponent', () => {
  let component: ChildGoalsComponent;
  let fixture: ComponentFixture<ChildGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChildGoalsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
