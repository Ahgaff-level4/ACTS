import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectActivityComponent } from './select-activity.component';

describe('SelectActivityComponent', () => {
  let component: SelectActivityComponent;
  let fixture: ComponentFixture<SelectActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectActivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
