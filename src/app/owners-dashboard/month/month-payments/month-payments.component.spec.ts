import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthPaymentsComponent } from './month-payments.component';

describe('MonthPaymentsComponent', () => {
  let component: MonthPaymentsComponent;
  let fixture: ComponentFixture<MonthPaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthPaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
