import { Component, OnInit, Input, ElementRef } from '@angular/core';

@Component({
    selector: 'app-signature',
    templateUrl: 'signature.component.html',
})

export class SignatureComponent {

    @Input() data: any;
    @Input() printMode: boolean;

    element: any;

    html: any;

    constructor(elm: ElementRef) {
        debugger;
        this.element = elm;
    }

    ngOnInit() {

        debugger;

        if (this.data) {

            debugger;
            let elementSVG = this.element.nativeElement.getElementsByTagName('svg');
            let elementParent = this.element.nativeElement.parentElement.parentElement;
            let widthsignatureContenier = elementParent.clientWidth;
            widthsignatureContenier = "100%";
            if (this.printMode) {
                widthsignatureContenier = "100%";
            }

            var path = this.makeSVG('path', { d: this.data, stroke: "#06067f", 'stroke-width': "2", 'stroke-linecap': "butt", fill: "none", 'stroke-linejoin': "miter" });
            // elementSVG.html("");
            // elementSVG.append(path);
            // elementSVG.width(widthsignatureContenier);
            elementSVG.svg.insertAdjacentElement(this.element.nativeElement, path);
            // elementSVG[0].outerHTML = path;
            //elementSVG[0].clientWidth = widthsignatureContenier;

            this.element.nativeElement.insertAdjacentElement(elementSVG);

            //this.html = elementSVG;
        }

    }

    makeSVG(tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }

}
