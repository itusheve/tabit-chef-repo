import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekMostSoldItemsComponent } from './week-most-sold-items.component';

describe('WeekMostSoldItemsComponent', () => {
  let component: WeekMostSoldItemsComponent;
  let fixture: ComponentFixture<WeekMostSoldItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekMostSoldItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekMostSoldItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
