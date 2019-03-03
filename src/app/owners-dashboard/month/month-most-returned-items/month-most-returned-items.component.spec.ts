import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthMostReturnedItemsComponent } from './month-most-returned-items.component';

describe('MonthMostReturnedItemsComponent', () => {
  let component: MonthMostReturnedItemsComponent;
  let fixture: ComponentFixture<MonthMostReturnedItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthMostReturnedItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthMostReturnedItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
