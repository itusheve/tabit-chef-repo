import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstrackTableComponent } from './abstrack-table.component';

describe('AbstrackTableComponent', () => {
  let component: AbstrackTableComponent;
  let fixture: ComponentFixture<AbstrackTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbstrackTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstrackTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
