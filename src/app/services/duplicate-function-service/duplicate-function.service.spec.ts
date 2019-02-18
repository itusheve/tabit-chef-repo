import { TestBed } from '@angular/core/testing';

import { DuplicateFunctionService } from './duplicate-function.service';

describe('DuplicateFunctionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DuplicateFunctionService = TestBed.get(DuplicateFunctionService);
    expect(service).toBeTruthy();
  });
});
