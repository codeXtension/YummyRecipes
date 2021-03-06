import {Directive, ElementRef, Renderer} from "@angular/core";

/**
 * Generated class for the FocuserDirective directive.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
 * for more info on Angular Directives.
 */
@Directive({
    selector: "[focuser]" // Attribute selector
})
export class FocuserDirective {
    constructor(public renderer: Renderer, public elementRef: ElementRef) {
    }

    ngOnInit() {
        //search bar is wrapped with a div so we get the child input
        const searchInput = this.elementRef.nativeElement.querySelector("input");
        setTimeout(() => {
            //delay required or ionic styling gets finicky
            this.renderer.invokeElementMethod(searchInput, "focus", []);
        }, 1);
    }
}
