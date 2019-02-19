import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthSalesByMainAndSubCategoriesComponent } from './month-sales-by-main-and-sub-categories.component';

describe('MonthSalesByMainAndSubCategoriesComponent', () => {
  let component: MonthSalesByMainAndSubCategoriesComponent;
  let fixture: ComponentFixture<MonthSalesByMainAndSubCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthSalesByMainAndSubCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthSalesByMainAndSubCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
