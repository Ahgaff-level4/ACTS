import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditChildComponent } from './add-edit-child.component';

describe('AddEditChildComponent', () => {
  let component: AddEditChildComponent;
  let fixture: ComponentFixture<AddEditChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditChildComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
