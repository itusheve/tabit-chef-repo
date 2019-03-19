import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekOrganizationalComponent } from './week-organizational.component';

describe('WeekOrganizationalComponent', () => {
  let component: WeekOrganizationalComponent;
  let fixture: ComponentFixture<WeekOrganizationalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekOrganizationalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekOrganizationalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
