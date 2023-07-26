import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAccountFormComponent } from './add-edit-account-form.component';

describe('AddEditAccountFormComponent', () => {
  let component: AddEditAccountFormComponent;
  let fixture: ComponentFixture<AddEditAccountFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAccountFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
