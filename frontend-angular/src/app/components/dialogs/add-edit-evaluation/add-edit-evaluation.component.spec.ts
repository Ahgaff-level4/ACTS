import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEvaluationComponent } from './add-edit-evaluation.component';

describe('AddEditEvaluationComponent', () => {
  let component: AddEditEvaluationComponent;
  let fixture: ComponentFixture<AddEditEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditEvaluationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
