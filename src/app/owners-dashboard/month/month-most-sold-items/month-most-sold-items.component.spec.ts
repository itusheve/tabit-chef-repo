import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthMostSoldItemsComponent } from './month-most-sold-items.component';

describe('MonthMostSoldItemsComponent', () => {
  let component: MonthMostSoldItemsComponent;
  let fixture: ComponentFixture<MonthMostSoldItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthMostSoldItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthMostSoldItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
