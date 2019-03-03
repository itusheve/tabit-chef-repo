import { TestBed } from '@angular/core/testing';

import { DataWareHouseEpService } from './data-ware-house-ep.service';

describe('DataWareHouseEpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataWareHouseEpService = TestBed.get(DataWareHouseEpService);
    expect(service).toBeTruthy();
  });
});
