import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DshGrid1Component } from './dsh-grid-1.component';

describe('DshGrid1Component', () => {
  let component: DshGrid1Component;
  let fixture: ComponentFixture<DshGrid1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DshGrid1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DshGrid1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
