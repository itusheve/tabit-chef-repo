import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractTableComponent } from './abstract-table.component';

describe('AbstractTableComponent', () => {
  let component: AbstractTableComponent;
  let fixture: ComponentFixture<AbstractTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbstractTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
