import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagersDashboardComponent } from './managers-dashboard.component';

describe('ManagersDashboardComponent', () => {
  let component: ManagersDashboardComponent;
  let fixture: ComponentFixture<ManagersDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagersDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagersDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
