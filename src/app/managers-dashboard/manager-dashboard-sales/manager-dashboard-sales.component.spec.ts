import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerDashboardSalesComponent } from './manager-dashboard-sales.component';

describe('ManagerDashboardSalesComponent', () => {
  let component: ManagerDashboardSalesComponent;
  let fixture: ComponentFixture<ManagerDashboardSalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerDashboardSalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerDashboardSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
