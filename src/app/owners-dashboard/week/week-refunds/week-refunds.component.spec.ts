import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekRefundsComponent } from './week-refunds.component';

describe('WeekRefundsComponent', () => {
  let component: WeekRefundsComponent;
  let fixture: ComponentFixture<WeekRefundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekRefundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekRefundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
