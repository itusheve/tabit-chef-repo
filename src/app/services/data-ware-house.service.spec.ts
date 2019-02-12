import { TestBed } from '@angular/core/testing';

import { DataWareHouseService } from './data-ware-house.service';

describe('DataWareHouseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataWareHouseService = TestBed.get(DataWareHouseService);
    expect(service).toBeTruthy();
  });
});
