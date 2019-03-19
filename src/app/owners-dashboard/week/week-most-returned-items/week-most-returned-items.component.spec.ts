import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekMostReturnedItemsComponent } from './week-most-returned-items.component';

describe('WeekMostReturnedItemsComponent', () => {
  let component: WeekMostReturnedItemsComponent;
  let fixture: ComponentFixture<WeekMostReturnedItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekMostReturnedItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekMostReturnedItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
