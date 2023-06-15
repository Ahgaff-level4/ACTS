import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableControllersComponent } from './table-controllers.component';

describe('TableControllersComponent', () => {
  let component: TableControllersComponent;
  let fixture: ComponentFixture<TableControllersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableControllersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableControllersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
