import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterChildrenComponent } from './filter-children.component';

describe('FilterChildrenComponent', () => {
  let component: FilterChildrenComponent;
  let fixture: ComponentFixture<FilterChildrenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterChildrenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
