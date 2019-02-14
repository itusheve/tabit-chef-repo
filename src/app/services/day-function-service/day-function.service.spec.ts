import { TestBed } from '@angular/core/testing';

import { DayFunctionService } from './day-function.service';

describe('DayFunctionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DayFunctionService = TestBed.get(DayFunctionService);
    expect(service).toBeTruthy();
  });
});
