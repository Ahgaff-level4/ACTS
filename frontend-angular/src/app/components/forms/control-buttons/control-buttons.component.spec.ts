import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlButtonsComponent } from './control-buttons.component';

describe('TableControllersComponent', () => {
  let component: ControlButtonsComponent;
  let fixture: ComponentFixture<ControlButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
