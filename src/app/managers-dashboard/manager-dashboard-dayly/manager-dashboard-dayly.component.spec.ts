import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerDashboardDaylyComponent } from './manager-dashboard-dayly.component';

describe('ManagerDashboardDaylyComponent', () => {
  let component: ManagerDashboardDaylyComponent;
  let fixture: ComponentFixture<ManagerDashboardDaylyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerDashboardDaylyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerDashboardDaylyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
