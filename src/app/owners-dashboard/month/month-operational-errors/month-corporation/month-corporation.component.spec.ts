import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthCorporationComponent } from './month-corporation.component';

describe('MonthCorporationComponent', () => {
  let component: MonthCorporationComponent;
  let fixture: ComponentFixture<MonthCorporationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthCorporationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthCorporationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
