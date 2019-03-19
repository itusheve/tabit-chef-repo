import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekRetentionComponent } from './week-retention.component';

describe('WeekRetentionComponent', () => {
  let component: WeekRetentionComponent;
  let fixture: ComponentFixture<WeekRetentionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekRetentionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekRetentionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
