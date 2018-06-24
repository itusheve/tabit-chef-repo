import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[ngxInit]',
})
export class NgxInitDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) {
  }

  @Input() set ngxInit(val: any) {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef, { ngxInit: val });
  }
}

@Directive({
  selector: '[ngxCollapse]',
  exportAs: 'ngxCollapse',
  host: { '[class.collapse]': 'true', '[class.show]': '!collapsed' }
})
export class NgxCollapseDirective {
  /**
   * A flag indicating collapsed (true) or open (false) state.
   */
  @Input('ngxCollapse') collapsed = false;
}
