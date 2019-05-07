import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekCorporationComponent } from './week-corporation.component';

describe('WeekCorporationComponent', () => {
  let component: WeekCorporationComponent;
  let fixture: ComponentFixture<WeekCorporationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekCorporationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekCorporationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
