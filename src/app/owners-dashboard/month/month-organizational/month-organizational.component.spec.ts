import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthOrganizationalComponent } from './month-organizational.component';

describe('MonthOrganizationalComponent', () => {
  let component: MonthOrganizationalComponent;
  let fixture: ComponentFixture<MonthOrganizationalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthOrganizationalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthOrganizationalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
