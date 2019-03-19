import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekWasteComponent } from './week-waste.component';

describe('WeekWasteComponent', () => {
  let component: WeekWasteComponent;
  let fixture: ComponentFixture<WeekWasteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekWasteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekWasteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
