import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthRefundsComponent } from './month-refunds.component';

describe('MonthRefundsComponent', () => {
  let component: MonthRefundsComponent;
  let fixture: ComponentFixture<MonthRefundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthRefundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthRefundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
