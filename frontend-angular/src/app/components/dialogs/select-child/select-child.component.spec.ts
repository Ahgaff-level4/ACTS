import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectChildComponent } from './select-child.component';

describe('SelectChildComponent', () => {
  let component: SelectChildComponent;
  let fixture: ComponentFixture<SelectChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectChildComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
