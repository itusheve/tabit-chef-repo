import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';


// interface Handler {
//     id: number;
//     cb: Function;
// }

/**
 * The service allows registering callbacks on elements once their visibility from the view port is toggled (become visible / invisible)
 *
 * @export
 * @class VisibilityService
 */
@Injectable()
export class VisibilityService {

    // private static counter = 0;

    // private handlers: Handler[] = [];

    // public register(el: Element) {

    // }

    public monitorVisibility(el: Element, scrollingContext?: Element): Observable<boolean> {
        if (!el) throw new Error('monitorVisibility: el is undefined');
        return Observable.create(obs=>{
            const handler = onVisibilityChange(el, function (visible) {
                obs.next(visible);
            });

            //we emit immediately with the current visibility status:
            handler();

            if ((<any>window).addEventListener) {
                addEventListener('DOMContentLoaded', handler, false); // IE9+ :(
                addEventListener('load', handler, false);
                if (scrollingContext) {
                    scrollingContext.addEventListener('scroll', handler, false);
                } else {
                    addEventListener('scroll', handler, false);
                }
                addEventListener('resize', handler, false);
            }
        });
    }

    constructor() {

        /* https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433 */
        // const handler = onVisibilityChange((<any>document.getElementById('testtest')), function () {
        //     debugger;
        // });
        // if ((<any>window).addEventListener) {
        //     addEventListener('DOMContentLoaded', handler, false); // IE9+ :(
        //     addEventListener('load', handler, false);
        //     addEventListener('scroll', handler, false);
        //     addEventListener('resize', handler, false);
        // }
    }

}

/* https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433 */
function isElementInViewport(el: Element): boolean {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}
function onVisibilityChange(el: Element, callback: Function): any {
    let old_visible: boolean;
    return function () {
        let visible = isElementInViewport(el);
        if (visible !== old_visible) {
            old_visible = visible;
            callback(visible);
        }
    };
}
