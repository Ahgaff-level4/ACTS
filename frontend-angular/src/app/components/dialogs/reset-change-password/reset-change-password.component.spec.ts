import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetChangePasswordComponent } from './reset-change-password.component';

describe('ResetChangePasswordComponent', () => {
  let component: ResetChangePasswordComponent;
  let fixture: ComponentFixture<ResetChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetChangePasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
