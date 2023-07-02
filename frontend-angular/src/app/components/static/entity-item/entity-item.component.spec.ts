import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityItemComponent } from './entity-item.component';

describe('EntityItemComponent', () => {
  let component: EntityItemComponent;
  let fixture: ComponentFixture<EntityItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
