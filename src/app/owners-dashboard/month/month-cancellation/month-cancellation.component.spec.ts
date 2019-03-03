import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthCancellationComponent } from './month-cancellation.component';

describe('MonthCancellationComponent', () => {
  let component: MonthCancellationComponent;
  let fixture: ComponentFixture<MonthCancellationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthCancellationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
