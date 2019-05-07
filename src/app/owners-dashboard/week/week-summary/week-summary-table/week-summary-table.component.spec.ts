import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekSummaryTableComponent } from './week-summary-table.component';

describe('WeekSummaryTableComponent', () => {
  let component: WeekSummaryTableComponent;
  let fixture: ComponentFixture<WeekSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
