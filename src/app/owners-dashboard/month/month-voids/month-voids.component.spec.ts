import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthVoidsComponent } from './month-voids.component';

describe('MonthVoidsComponent', () => {
  let component: MonthVoidsComponent;
  let fixture: ComponentFixture<MonthVoidsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthVoidsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthVoidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
