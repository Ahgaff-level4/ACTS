import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchExportComponent } from './search-export.component';

describe('SearchExportComponent', () => {
  let component: SearchExportComponent;
  let fixture: ComponentFixture<SearchExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchExportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
