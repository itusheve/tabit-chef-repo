import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthPromotionsComponent } from './month-promotions.component';

describe('MonthPromotionsComponent', () => {
  let component: MonthPromotionsComponent;
  let fixture: ComponentFixture<MonthPromotionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthPromotionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
