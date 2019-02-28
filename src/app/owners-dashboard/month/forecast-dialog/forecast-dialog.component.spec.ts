import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastDialogComponent } from './forecast-dialog.component';

describe('ForecastDialogComponent', () => {
  let component: ForecastDialogComponent;
  let fixture: ComponentFixture<ForecastDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForecastDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
