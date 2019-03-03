import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthRetentionComponent } from './month-retention.component';

describe('MonthRetentionComponent', () => {
  let component: MonthRetentionComponent;
  let fixture: ComponentFixture<MonthRetentionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthRetentionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthRetentionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
