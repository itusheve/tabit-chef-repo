import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekPromotionComponent } from './week-promotion.component';

describe('WeekPromotionComponent', () => {
  let component: WeekPromotionComponent;
  let fixture: ComponentFixture<WeekPromotionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekPromotionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekPromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
