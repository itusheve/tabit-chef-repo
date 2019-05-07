import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekCorporationReturnComponent } from './week-corporation-return.component';

describe('WeekCorporationReturnComponent', () => {
  let component: WeekCorporationReturnComponent;
  let fixture: ComponentFixture<WeekCorporationReturnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekCorporationReturnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekCorporationReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
