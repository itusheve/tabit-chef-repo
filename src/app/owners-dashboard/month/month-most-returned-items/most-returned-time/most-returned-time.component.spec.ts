import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MostReturnedTimeComponent } from './most-returned-time.component';

describe('MostReturnedTimeComponent', () => {
  let component: MostReturnedTimeComponent;
  let fixture: ComponentFixture<MostReturnedTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MostReturnedTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MostReturnedTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
