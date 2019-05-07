import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekMostReturnSingleComponent } from './week-most-return-single.component';

describe('WeekMostReturnSingleComponent', () => {
  let component: WeekMostReturnSingleComponent;
  let fixture: ComponentFixture<WeekMostReturnSingleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekMostReturnSingleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekMostReturnSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
