import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekOperationalErrorsComponent } from './week-operational-errors.component';

describe('WeekOperationalErrorsComponent', () => {
  let component: WeekOperationalErrorsComponent;
  let fixture: ComponentFixture<WeekOperationalErrorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekOperationalErrorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekOperationalErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
