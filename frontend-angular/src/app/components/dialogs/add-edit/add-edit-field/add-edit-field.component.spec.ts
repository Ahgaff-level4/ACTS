import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFieldComponent } from './add-edit-field.component';

describe('AddEditFieldComponent', () => {
  let component: AddEditFieldComponent;
  let fixture: ComponentFixture<AddEditFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
