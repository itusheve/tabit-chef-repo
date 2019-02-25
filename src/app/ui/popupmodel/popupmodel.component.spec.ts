import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupmodelComponent } from './popupmodel.component';

describe('PopupmodelComponent', () => {
  let component: PopupmodelComponent;
  let fixture: ComponentFixture<PopupmodelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupmodelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupmodelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
