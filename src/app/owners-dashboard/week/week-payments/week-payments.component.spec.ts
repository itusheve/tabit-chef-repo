import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekPaymentsComponent } from './week-payments.component';

describe('WeekPaymentsNewComponent', () => {
  let component: WeekPaymentsComponent;
  let fixture: ComponentFixture<WeekPaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekPaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
