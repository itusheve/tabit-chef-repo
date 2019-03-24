import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayRefundComponent } from './day-refund.component';

describe('DayRefundComponent', () => {
  let component: DayRefundComponent;
  let fixture: ComponentFixture<DayRefundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayRefundComponent ]
    })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
