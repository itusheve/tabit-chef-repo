import { Component, Input, OnChanges, ElementRef, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-signature',
    templateUrl: 'signature.component.html',
    styleUrls: ['./signature.component.scss']
})

export class SignatureComponent implements OnChanges {

    @Input() data: any;
    @Input() printMode: boolean;

    element: any;

    constructor(
        elm: ElementRef, ) {
        this.element = elm;
    }


    ngOnChanges(o: SimpleChanges) {

        let elementSVG = this.element.nativeElement.getElementsByTagName('svg');

        try {
            elementSVG.svg.childNodes[1].remove();
        } catch (error) {

        }

        if (this.data) {

            let elementSVG = this.element.nativeElement.getElementsByTagName('svg');

            let path = this.makeSVG('path', { d: this.data, stroke: "#06067f", 'stroke-width': "2", 'stroke-linecap': "butt", fill: "none", 'stroke-linejoin': "miter" });

            elementSVG.svg.appendChild(path);
        }

    }

    makeSVG(tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }

}
