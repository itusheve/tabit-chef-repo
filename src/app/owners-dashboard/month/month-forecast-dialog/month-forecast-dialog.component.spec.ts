import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthForecastDialogComponent } from './month-forecast-dialog.component';

describe('MonthForecastDialogComponent', () => {
  let component: MonthForecastDialogComponent;
  let fixture: ComponentFixture<MonthForecastDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthForecastDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthForecastDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
