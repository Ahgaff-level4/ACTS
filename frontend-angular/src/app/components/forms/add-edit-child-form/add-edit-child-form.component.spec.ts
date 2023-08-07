import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditChildFormComponent } from './add-edit-child-form.component';

describe('AddEditChildFormComponent', () => {
  let component: AddEditChildFormComponent;
  let fixture: ComponentFixture<AddEditChildFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditChildFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditChildFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
