import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateItemComponent } from './rate-item.component';

describe('RateItemComponent', () => {
  let component: RateItemComponent;
  let fixture: ComponentFixture<RateItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RateItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
