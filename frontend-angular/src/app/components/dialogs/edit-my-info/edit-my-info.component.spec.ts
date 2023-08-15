import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMyInfoComponent } from './edit-my-info.component';

describe('EditMyInfoComponent', () => {
  let component: EditMyInfoComponent;
  let fixture: ComponentFixture<EditMyInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMyInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
