import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekSummaryComponent } from './week-summary.component';

describe('WeekSummaryComponent', () => {
  let component: WeekSummaryComponent;
  let fixture: ComponentFixture<WeekSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
