import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditGoalComponent } from './add-edit-goal.component';

describe('AddEditGoalComponent', () => {
  let component: AddEditGoalComponent;
  let fixture: ComponentFixture<AddEditGoalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditGoalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
