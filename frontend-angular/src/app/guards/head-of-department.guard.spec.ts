import { TestBed } from '@angular/core/testing';

import { HeadOfDepartmentGuard } from './head-of-department.guard';

describe('HeadOfDepartmentGuard', () => {
  let guard: HeadOfDepartmentGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HeadOfDepartmentGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
