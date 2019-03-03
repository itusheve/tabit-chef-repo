import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthWasteComponent } from './month-waste.component';

describe('MonthWasteComponent', () => {
  let component: MonthWasteComponent;
  let fixture: ComponentFixture<MonthWasteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthWasteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthWasteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
