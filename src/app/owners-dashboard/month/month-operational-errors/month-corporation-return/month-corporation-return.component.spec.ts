import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthCorporationReturnComponent } from './month-corporation-return.component';

describe('MonthCorporationReturnComponent', () => {
  let component: MonthCorporationReturnComponent;
  let fixture: ComponentFixture<MonthCorporationReturnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthCorporationReturnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthCorporationReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
