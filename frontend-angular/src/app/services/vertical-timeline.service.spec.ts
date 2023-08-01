import { TestBed } from '@angular/core/testing';

import { VerticalTimelineService } from './vertical-timeline.service';

describe('TimelineService', () => {
  let service: VerticalTimelineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerticalTimelineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
