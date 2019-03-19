import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekCancellationComponent } from './week-cancellation.component';

describe('WeekCancellationComponent', () => {
  let component: WeekCancellationComponent;
  let fixture: ComponentFixture<WeekCancellationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekCancellationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
