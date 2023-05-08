import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditStrengthComponent } from './add-edit-strength.component';

describe('AddEditStrengthComponent', () => {
  let component: AddEditStrengthComponent;
  let fixture: ComponentFixture<AddEditStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditStrengthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditStrengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
