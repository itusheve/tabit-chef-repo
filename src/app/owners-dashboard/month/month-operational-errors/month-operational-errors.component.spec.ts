import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthOperationalErrorsComponent } from './month-operational-errors.component';

describe('MonthOperationalErrorsComponent', () => {
  let component: MonthOperationalErrorsComponent;
  let fixture: ComponentFixture<MonthOperationalErrorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthOperationalErrorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthOperationalErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
